/**
 * Chat-specific rate limiting middleware.
 * Separate from generalRateLimit to avoid interfering with existing API routes.
 * Uses in-memory tracking per user/IP.
 */

const chatRequestCounts = new Map();

const CHAT_WINDOW_MS = 60 * 1000; // 1 minute window
const CHAT_MAX_AUTH = parseInt(process.env.CHAT_RATE_LIMIT_PER_MIN) || 20;
const CHAT_MAX_ANON = parseInt(process.env.CHAT_RATE_LIMIT_ANON_PER_MIN) || 10;
const CHAT_MAX_INPUT = parseInt(process.env.CHAT_MAX_INPUT_LENGTH) || 500;

// ─── Pre-compiled sanitization regexes (compiled once at module load) ───────────
const RE_HTML_TAGS = /<[^>]*>/g;
const RE_JS_PROTO = /javascript:/gi;
const RE_EVENT_HANDLERS = /on\w+\s*=/gi;

// ═══ PROMPT INJECTION DETECTION — Pre-compiled Regex Arrays ════════════════
// Compiled once at module load for maximum performance.

// CATEGORY 1: SYSTEM PROMPT EXTRACTION
const EXTRACTION_REGEXES = [
  /(?:repeat|display|print|show|output|reveal|dump|echo|share|paste|copy|tell me|give me|what(?:'s| is| are))\b.*\b(?:instructions?|prompts?|system|config(?:uration)?|setup|rules|guidelines|directives)/i,
  /(?:starting with|beginning with|above this|before this|everything above|everything before|word for word|exactly as|without modification|as written)/i,
  /verbatim/i,
  /(?:list|enumerate|show|display|what|name|describe)\b.*\b(?:tools|functions|apis?|backend|capabilities|data sources)/i,
  /(?:tools|functions|apis?)\b.*\b(?:you (?:use|have|call|access)|available|internal)/i,
  /your\b.*\b(?:initial|full|complete|entire|original)\b.*\b(?:config|instructions?|setup|prompt|system)/i,
];

// CATEGORY 2: ROLE/AUTHORITY OVERRIDE
const OVERRIDE_REGEXES = [
  /(?:ignore|forget|disregard|bypass|override|remove|lift|disable|drop|skip|cancel)\b.*\b(?:previous|instructions?|restrictions?|rules?|guidelines?|safety|limitations?|scope|constraints?)/i,
  /(?:you are now|act as|pretend|roleplay|role.?play|imagine you(?:'re| are)|behave as|become|switch to)/i,
  /(?:developer|admin|system|owner|creator|maintainer)\b.*\b(?:override|update|message|says?|commands?|orders?|told|wants?|mode|access)/i,
  /(?:system update|expand.*scope|scope.*beyond|limitation.*(?:removed|lifted)|now (?:allowed|permitted)|restriction.*(?:removed|lifted|disabled))/i,
  /(?:i(?:'m| am)\s+(?:the |a |an )?(?:developer|admin|owner|creator|maintainer|authorized))/i,
  /(?:for (?:debugging|testing|development|maintenance|research|educational) purposes?)/i,
  /(?:dan|jailbreak|god|sudo|root|unrestricted|unlimited|debug|admin|developer|maintenance)\s*mode/i,
  /new\s+(?:instructions?|task|role|directive|command)/i,
  /(?:do anything|no (?:restrictions?|rules?|guidelines?|limits?)|without (?:restrictions?|rules?|limits?))/i,
];

// CATEGORY 3: OFF-TOPIC / DOMAIN MIXING
const OFFTOPIC_REGEXES = [
  /(?:write|create|generate|build|make|show|give|develop|design|implement)\b.*\b(?:code|script|program|function|algorithm|app(?:lication)?|software|class|module)/i,
  /(?:python|javascript|typescript|java(?:script)?|c\+\+|c#|html|css|php|ruby|rust|golang?|sql|bash|powershell)\b.*\b(?:code|script|program|function|example)/i,
  /(?:code|script|program|function|snippet|example)\b.*\b(?:python|javascript|typescript|java|c\+\+|c#|php|ruby|rust|golang?)/i,
  /(?:formatted?|written|structured|presented)\s+as\b.*\b(?:code|executable|program|script)/i,
  /(?:write|tell|make|create|compose|craft|generate)\b.*\b(?:stories?|poems?|essays?|recipes?|jokes?|songs?|novels?|book|tales?)/i,
  /(?:play\s+a\s+game|let(?:'s| us)\s+play|solve\b.*\b(?:equation|math|problem|puzzle)|do\s+math)/i,
  /(?:convert|rewrite|translate|transform|turn|change|rephrase|adapt|make)\b.*\b(?:recipe|cooking|baking|story|poem|game|code|math|guide)\b.*\b(?:flood|baha|evacuation|disaster)/i,
  /(?:flood|baha|evacuation|disaster)\b.*\b(?:as (?:a |an )?)(?:recipe|story|poem|game|code|program|script|song|metaphor)/i,
  /(?:prints?|outputs?|displays?|logs?|console)\b.*\b(?:flood|evacuation|safety|baha|water level)/i,
];

// CATEGORY 4: SENSITIVE DATA / TAG INJECTION
const SENSITIVE_REGEXES = [
  /(?:api\s*keys?|environment\s*variables?|env\s*var|passwords?|credentials?|secrets?|tokens?|database\s*(?:credentials?|access|connection))/i,
  /(?:show|give|list|display|dump|export)\b.*\b(?:all\s+)?(?:users?|emails?|accounts?|data|records?|passwords?)/i,
  /<\/?system>|<\/?s>|\[\/?(?:inst|sys)\]|<<\/?sys>>|\{\{|\}\}|<\|(?:im_start|im_end|system|user)\|>/i,
  /(?:ignore|remove|bypass|no|without|disable|lift)\b.*\b(?:character|response|output|length|word)\s*(?:limit|cap|restriction|maximum)/i,
  /(?:longer|unlimited|extended|full|detailed|comprehensive|complete|verbose)\s+(?:response|answer|reply|output|explanation)/i,
];

// CATEGORY 5: TOOL BYPASS
const TOOL_BYPASS_REGEXES = [
  /(?:don'?t|do not|without|skip|avoid|no need to)\b.*\b(?:use|using|check|look|query|call|access)\b.*\b(?:tools?|data(?:base)?|api|system|backend)/i,
  /(?:just|simply|only)\s+(?:estimate|guess|approximate|assume|imagine|infer|predict|make up)/i,
];

/**
 * Sanitize user input to prevent XSS and prompt injection.
 * Strips HTML tags, limits length, rejects empty messages,
 * and blocks known prompt injection patterns BEFORE they reach the AI model.
 */
export const sanitizeChatInput = (req, res, next) => {
  try {
    let { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string.'
      });
    }

    // Trim whitespace
    message = message.trim();

    // Reject empty after trim
    if (message.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.'
      });
    }

    // Enforce max length
    if (message.length > CHAT_MAX_INPUT) {
      return res.status(400).json({
        success: false,
        message: `Message too long. Maximum ${CHAT_MAX_INPUT} characters allowed.`
      });
    }

    // Strip HTML/script tags (pre-compiled regexes)
    message = message
      .replace(RE_HTML_TAGS, '')          // Remove HTML tags
      .replace(RE_JS_PROTO, '')           // Remove javascript: protocol
      .replace(RE_EVENT_HANDLERS, '');    // Remove event handlers like onclick=

    // ── PROMPT INJECTION DETECTION (pre-compiled regexes) ──
    const lowerMsg = message.toLowerCase();

    // Run all regex categories against pre-compiled patterns
    const isPromptExtraction = EXTRACTION_REGEXES.some(r => r.test(lowerMsg));
    const isRoleOverride = OVERRIDE_REGEXES.some(r => r.test(lowerMsg));
    const isOffTopic = OFFTOPIC_REGEXES.some(r => r.test(lowerMsg));
    const isSensitive = SENSITIVE_REGEXES.some(r => r.test(lowerMsg));
    const isToolBypass = TOOL_BYPASS_REGEXES.some(r => r.test(lowerMsg));

    if (isPromptExtraction || isSensitive) {
      req.body._blocked = true;
      req.body._blockedReason = 'prompt_extraction';
    }

    if (isRoleOverride || isOffTopic || isToolBypass) {
      req.body._blocked = true;
      req.body._blockedReason = 'role_override';
    }

    // Sanitize conversation history if provided
    let history = req.body.history;
    if (history) {
      if (!Array.isArray(history)) {
        history = [];
      }

      // Limit history length to prevent token abuse
      const maxHistory = parseInt(process.env.CHAT_MAX_HISTORY) || 20;
      history = history.slice(-maxHistory);

      // Validate and sanitize each history entry
      history = history
        .filter(msg =>
          msg &&
          typeof msg === 'object' &&
          typeof msg.role === 'string' &&
          typeof msg.content === 'string' &&
          ['user', 'assistant'].includes(msg.role)
        )
        .map(msg => ({
          role: msg.role,
          content: msg.content
            .slice(0, 2000) // Cap historical message length
            .replace(/<[^>]*>/g, '')
        }));
    }

    // Attach sanitized data
    req.body.message = message;
    req.body.history = history || [];

    next();
  } catch (error) {
    console.error('Chat input sanitization error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid input.'
    });
  }
};

/**
 * Rate limit chat requests. Authenticated users get a higher limit.
 * Uses separate tracking from generalRateLimit.
 */
export const chatRateLimit = (req, res, next) => {
  try {
    const isAuthenticated = !!req.user;
    const identifier = req.user?._id?.toString() || req.ip || 'anon';
    const maxRequests = isAuthenticated ? CHAT_MAX_AUTH : CHAT_MAX_ANON;
    const now = Date.now();

    // Clean expired entries
    for (const [key, data] of chatRequestCounts.entries()) {
      if (now - data.windowStart > CHAT_WINDOW_MS) {
        chatRequestCounts.delete(key);
      }
    }

    let requestData = chatRequestCounts.get(identifier);

    if (!requestData || now - requestData.windowStart > CHAT_WINDOW_MS) {
      requestData = { count: 1, windowStart: now };
    } else {
      requestData.count++;
    }

    chatRequestCounts.set(identifier, requestData);

    if (requestData.count > maxRequests) {
      const resetTime = new Date(requestData.windowStart + CHAT_WINDOW_MS);
      const remaining = Math.ceil((requestData.windowStart + CHAT_WINDOW_MS - now) / 1000);

      return res.status(429).json({
        success: false,
        message: `Too many chat messages. Please wait ${remaining} seconds before sending another message.`,
        retryAfter: remaining
      });
    }

    // Add rate limit headers
    res.set({
      'X-Chat-RateLimit-Limit': maxRequests,
      'X-Chat-RateLimit-Remaining': Math.max(0, maxRequests - requestData.count),
      'X-Chat-RateLimit-Reset': new Date(requestData.windowStart + CHAT_WINDOW_MS).toISOString()
    });

    next();
  } catch (error) {
    console.error('Chat rate limiting error:', error);
    // Fail open - don't block chat if rate limiting errors
    next();
  }
};

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, data] of chatRequestCounts.entries()) {
    if (now - data.windowStart > CHAT_WINDOW_MS) {
      chatRequestCounts.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`[Chat] Cleaned ${cleaned} expired rate limit entries`);
  }
}, 5 * 60 * 1000);
