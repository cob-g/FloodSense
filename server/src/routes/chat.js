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
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

/**
 * Optional authentication middleware.
 * Unlike the main `authenticate` middleware, this does NOT return 401.
 * If a valid token is present, req.user is set. Otherwise, req.user = null.
 * This allows both anonymous and authenticated users to use the chatbot.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select('name email barangay role isActive');

      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch {
    // Token invalid or expired — continue as anonymous
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
      const { message, history } = req.body;

      console.log(`[Chat] ${req.user ? req.user.name : 'Anonymous'} (${req.ip}): "${message.substring(0, 80)}..."`);

      const startTime = Date.now();
      const result = await processChat(message, history, req.user);
      const duration = Date.now() - startTime;

      console.log(`[Chat] Response in ${duration}ms, tools: [${result.toolsUsed.join(', ')}]`);

      res.json({
        success: true,
        data: {
          reply: result.reply,
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

export default router;
