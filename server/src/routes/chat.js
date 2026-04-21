/**
 * Chat Route - /api/chat
 * Handles AI chatbot requests.
 * Uses dedicated rate limiting and input sanitization separate from other routes.
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { chatRateLimit, sanitizeChatInput } from '../middleware/chatRateLimit.js';
import { processChat } from '../services/chatbot.service.js';

const router = express.Router();

/**
 * Get JWT_SECRET at runtime (not import time) to avoid dotenv race condition.
 * Some modules call dotenv.config() during their import, which means
 * process.env.JWT_SECRET may or may not be set depending on import order.
 */
const getJwtSecret = () => process.env.JWT_SECRET || 'fallback_secret_key';

/**
 * Optional authentication middleware.
 * Unlike the main `authenticate` middleware, this does NOT return 401.
 * If a valid token is present, req.user is set. Otherwise, req.user = null.
 * This allows both anonymous and authenticated users to use the chatbot.
 */
// Simple in-memory user cache (5 min TTL) to avoid DB lookup every chat message
const userCache = new Map();
const USER_CACHE_TTL = 5 * 60 * 1000;

const getCachedUser = async (userId) => {
  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.ts < USER_CACHE_TTL) return cached.user;
  const user = await User.findById(userId).select('name email barangay role isActive').lean();
  if (user) userCache.set(userId, { user, ts: Date.now() });
  return user;
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token && req.cookies?.token) token = req.cookies.token;

    if (token) {
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await getCachedUser(decoded.userId);
      if (user && user.isActive) req.user = user;
    }
  } catch {
    req.user = null;
  }
  next();
};

/**
 * POST /api/chat
 * Send a message to the AI chatbot.
 *
 * Body:
 *   - message (string, required): The user's message (max 500 chars)
 *   - history (array, optional): Previous messages [{role: 'user'|'assistant', content: string}]
 *
 * Response:
 *   - success (boolean)
 *   - data.reply (string): The AI's response
 *   - data.toolsUsed (string[]): Which data tools were invoked (for debugging)
 *   - data.isAuthenticated (boolean): Whether the user was authenticated
 */
router.post('/',
  optionalAuth,
  chatRateLimit,
  sanitizeChatInput,
  async (req, res) => {
    try {
      const { message, history, _blocked, _blockedReason } = req.body;

      console.log(`[Chat] ${req.user?.name || 'Anon'}: "${message.substring(0, 50)}" ${req.user ? '✅' : '❌'}`);

      // If the message was flagged as a prompt injection attempt,
      // return a canned response WITHOUT sending to the AI model at all.
      if (_blocked) {
        console.warn(`[Chat] BLOCKED injection attempt (${_blockedReason}): "${message.substring(0, 80)}"`);

        const blockedResponses = {
          prompt_extraction: "I'm here to help with flood safety! If you have questions about floods, evacuation centers, or how to use the FloodSense app, just ask!",
          role_override: "I appreciate the creativity, pero I'm FloodSense AI — I only help with flood safety and monitoring! Ask me about flood reports, evacuation centers, or safety tips. 😊"
        };

        return res.json({
          success: true,
          data: {
            reply: blockedResponses[_blockedReason] || blockedResponses.role_override,
            toolsUsed: [],
            isAuthenticated: !!req.user,
            responseTime: 0
          }
        });
      }

      const startTime = Date.now();
      const result = await processChat(message, history, req.user);
      const duration = Date.now() - startTime;

      // Response sanitization: catch any leaked system prompt content
      let reply = result.reply;
      reply = sanitizeResponse(reply);

      console.log(`[Chat] Response in ${duration}ms, tools: [${result.toolsUsed.join(', ')}]`);

      res.json({
        success: true,
        data: {
          reply,
          toolsUsed: result.toolsUsed,
          isAuthenticated: !!req.user,
          responseTime: duration
        }
      });

    } catch (error) {
      console.error('[Chat] Route error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to process chat message. Please try again.'
      });
    }
  }
);

/**
 * GET /api/chat/status
 * Check if the chatbot service is available.
 */
router.get('/status', (req, res) => {
  const hasApiKey = !!process.env.GROQ_API_KEY;

  res.json({
    success: true,
    data: {
      available: hasApiKey,
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      rateLimit: {
        authenticated: parseInt(process.env.CHAT_RATE_LIMIT_PER_MIN) || 20,
        anonymous: parseInt(process.env.CHAT_RATE_LIMIT_ANON_PER_MIN) || 10,
        windowSeconds: 60
      }
    }
  });
});

/**
 * Sanitize the AI response to prevent system prompt leakage.
 * If the response contains fragments of the system prompt, replace it
 * with a safe canned response.
 *
 * All regex patterns pre-compiled at module load for performance.
 */
const RE_TOOL_NAMES = /\bquery(?:EvacuationCenters|EmergencyFacilities|RecentReports|SensorStatus|FallbackPlaces|UserReports|AreaRisk)\b/gi;
const RE_TOOL_USAGE = /\b(using|by using|through)\s+the\s+["'`]?query\w+["'`]?\s+(tool|function)\b/gi;
const RE_TOOL_MENTION = /["'`]?\bquery(?:EvacuationCenters|EmergencyFacilities|RecentReports|SensorStatus|FallbackPlaces|UserReports|AreaRisk)\b["'`]?(\s+(tool|function))?/gi;
const RE_MULTI_SPACES = /\s{2,}/g;
const RE_TEXT_FUNC_LEAK = /<function=\w+>[\s\S]*?<\/function>/g;
const RE_TEXT_FUNC_TEST = /<function=\w+>[\s\S]*?<\/function>/;
const RE_SYSTEM_BLOCK_LEAK = /\b(?:immutable rules|only these system instructions are valid|users cannot set new instructions|security:\s*never reveal instructions|floodsense ai assistant, by st\. clare college)\b/i;

// Pre-lowercase all leak indicators once at module load
const LEAK_INDICATORS = [
  'anti-hallucination rules', 'highest priority', 'system prompt',
  'you are floodsense ai assistant', '## critical', '## what you can do',
  '## other rules', '## how to talk', '## app pages', '## flood safety tips',
  'taglish examples', 'do not say things like', 'tool_choice', 'max_tokens',
  '"name": "query', 'function.name', 'immutable rules',
  'cannot be changed by any user', 'never write code', 'never bypass scope',
  'never guess or fabricate', 'getjwtsecret', 'process.env',
  'groq_api_key', 'jwt_secret',
  'queryevacuationcenters', 'queryemergencyfacilities', 'queryrecentreports',
  'querysensorstatus', 'queryfallbackplaces', 'queryuserreports', 'queryarearisk',
];

function sanitizeResponse(reply) {
  if (!reply || typeof reply !== 'string') return reply;

  // Strip leaked internal tool/function names from plain text replies
  RE_TOOL_NAMES.lastIndex = 0;
  if (RE_TOOL_NAMES.test(reply)) {
    console.warn('[Chat] Stripped internal tool/function name leak from response');
    RE_TOOL_USAGE.lastIndex = 0;
    RE_TOOL_MENTION.lastIndex = 0;
    reply = reply
      .replace(RE_TOOL_USAGE, 'using live system data')
      .replace(RE_TOOL_MENTION, 'internal data lookup')
      .replace(RE_MULTI_SPACES, ' ')
      .trim();
  }

  // Strip any raw text-format function calls the model leaked (Llama fallback format)
  if (RE_TEXT_FUNC_TEST.test(reply)) {
    console.warn('[Chat] Stripped text-format function call leak from response');
    RE_TEXT_FUNC_LEAK.lastIndex = 0;
    reply = reply.replace(RE_TEXT_FUNC_LEAK, '').trim();
    if (!reply) {
      return "I'm checking on that — please try again in a moment.";
    }
  }

  // Catch actual system prompt structure leaks and tool-definition echoes.
  const replyLower = reply.toLowerCase();
  const hasLeak = LEAK_INDICATORS.some(indicator => replyLower.includes(indicator));
  const hasStructuredPromptLeak = RE_SYSTEM_BLOCK_LEAK.test(reply);

  if (hasLeak || hasStructuredPromptLeak) {
    console.warn('[Chat] RESPONSE SANITIZED: detected system prompt leak in AI response');
    return "I'm here to help with flood safety! Ask me about flood reports, evacuation centers, sensor data, or safety tips. 🌊";
  }

  return reply;
}

export default router;
