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

/**
 * Sanitize user input to prevent XSS and prompt injection.
 * Strips HTML tags, limits length, and rejects empty messages.
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

    // Strip HTML/script tags
    message = message
      .replace(/<[^>]*>/g, '')           // Remove HTML tags
      .replace(/javascript:/gi, '')       // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '');        // Remove event handlers like onclick=

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
