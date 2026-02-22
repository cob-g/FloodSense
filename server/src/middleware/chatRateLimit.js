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

    // Strip HTML/script tags
    message = message
      .replace(/<[^>]*>/g, '')           // Remove HTML tags
      .replace(/javascript:/gi, '')       // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '');        // Remove event handlers like onclick=

    // ── PROMPT INJECTION DETECTION (Regex Intent System) ──
    // Instead of matching exact phrases (which can be rephrased around),
    // this uses regex patterns that detect the INTENT behind injection attempts.
    // Each regex catches hundreds of rephrasings of the same attack type.
    const lowerMsg = message.toLowerCase();

    // ═══ CATEGORY 1: SYSTEM PROMPT EXTRACTION ═══
    // Catches: "repeat/display/print/show/output/reveal your instructions/prompt/config/setup"
    const EXTRACTION_REGEXES = [
      // "repeat/display/print/show/output/reveal/dump/echo" + "instructions/prompt/system/config/setup/rules"
      /(?:repeat|display|print|show|output|reveal|dump|echo|share|paste|copy|tell me|give me|what(?:'s| is| are))\b.*\b(?:instructions?|prompts?|system|config(?:uration)?|setup|rules|guidelines|directives)/i,
      // "starting with" / "beginning with" / "above this" — extraction framing
      /(?:starting with|beginning with|above this|before this|everything above|everything before|word for word|exactly as|without modification|as written)/i,
      // "verbatim" anywhere
      /verbatim/i,
      // "what tools" / "list tools" / "enumerate tools" / "backend functions" / "internal APIs"
      /(?:list|enumerate|show|display|what|name|describe)\b.*\b(?:tools|functions|apis?|backend|capabilities|data sources)/i,
      // "tools you use" / "tools available" / "internal tools"
      /(?:tools|functions|apis?)\b.*\b(?:you (?:use|have|call|access)|available|internal)/i,
      // "your initial/full/complete" + "configuration/instructions/setup"
      /your\b.*\b(?:initial|full|complete|entire|original)\b.*\b(?:config|instructions?|setup|prompt|system)/i,
    ];

    // ═══ CATEGORY 2: ROLE/AUTHORITY OVERRIDE ═══
    const OVERRIDE_REGEXES = [
      // "ignore/forget/disregard/bypass/override" + "previous/instructions/restrictions/rules/guidelines/safety"
      /(?:ignore|forget|disregard|bypass|override|remove|lift|disable|drop|skip|cancel)\b.*\b(?:previous|instructions?|restrictions?|rules?|guidelines?|safety|limitations?|scope|constraints?)/i,
      // "you are now" / "act as" / "pretend" / "roleplay" / "role-play"
      /(?:you are now|act as|pretend|roleplay|role.?play|imagine you(?:'re| are)|behave as|become|switch to)/i,
      // Fake authority: "(developer|admin|system|owner)" + "(override|update|message|says|command|order|told)"
      /(?:developer|admin|system|owner|creator|maintainer)\b.*\b(?:override|update|message|says?|commands?|orders?|told|wants?|mode|access)/i,
      // "system update" / "scope beyond" / "limitation removed" / "now allowed" / "expand scope"
      /(?:system update|expand.*scope|scope.*beyond|limitation.*(?:removed|lifted)|now (?:allowed|permitted)|restriction.*(?:removed|lifted|disabled))/i,
      // Authority claims: "I am the developer/admin" etc.
      /(?:i(?:'m| am)\s+(?:the |a |an )?(?:developer|admin|owner|creator|maintainer|authorized))/i,
      // "for debugging/testing" — false urgency
      /(?:for (?:debugging|testing|development|maintenance|research|educational) purposes?)/i,
      // Role modes: "DAN/jailbreak/debug/admin/developer/maintenance mode"
      /(?:dan|jailbreak|god|sudo|root|unrestricted|unlimited|debug|admin|developer|maintenance)\s*mode/i,
      // "new instructions/task/role"
      /new\s+(?:instructions?|task|role|directive|command)/i,
      // "do anything now" / "no restrictions" / "no rules" / "without restrictions"
      /(?:do anything|no (?:restrictions?|rules?|guidelines?|limits?)|without (?:restrictions?|rules?|limits?))/i,
    ];

    // ═══ CATEGORY 3: OFF-TOPIC / DOMAIN MIXING ═══
    const OFFTOPIC_REGEXES = [
      // Coding requests: "(write|create|generate|build|make|show|give)" + "(code|script|program|function|algorithm)"
      /(?:write|create|generate|build|make|show|give|develop|design|implement)\b.*\b(?:code|script|program|function|algorithm|app(?:lication)?|software|class|module)/i,
      // Coding language mentions: "python|javascript|java|c\+\+|etc." (only block when combined with action verbs)
      /(?:python|javascript|typescript|java(?:script)?|c\+\+|c#|html|css|php|ruby|rust|golang?|sql|bash|powershell)\b.*\b(?:code|script|program|function|example)/i,
      // Reverse: code/script + coding languages
      /(?:code|script|program|function|snippet|example)\b.*\b(?:python|javascript|typescript|java|c\+\+|c#|php|ruby|rust|golang?)/i,
      // "formatted as" + "code/executable/program"
      /(?:formatted?|written|structured|presented)\s+as\b.*\b(?:code|executable|program|script)/i,
      // Off-topic content: "(write|tell|make|create)" + "(story|poem|essay|recipe|joke|song|game)"
      /(?:write|tell|make|create|compose|craft|generate)\b.*\b(?:stories?|poems?|essays?|recipes?|jokes?|songs?|novels?|book|tales?)/i,
      // "play a game" / "let's play" / "solve equation" / "do math"
      /(?:play\s+a\s+game|let(?:'s| us)\s+play|solve\b.*\b(?:equation|math|problem|puzzle)|do\s+math)/i,
      // Scope blending: "(convert|rewrite|translate|transform|turn|make|rephrase)" + off-topic + "flood"
      /(?:convert|rewrite|translate|transform|turn|change|rephrase|adapt|make)\b.*\b(?:recipe|cooking|baking|story|poem|game|code|math|guide)\b.*\b(?:flood|baha|evacuation|disaster)/i,
      // Reverse scope blending: flood + "as" + off-topic
      /(?:flood|baha|evacuation|disaster)\b.*\b(?:as (?:a |an )?)(?:recipe|story|poem|game|code|program|script|song|metaphor)/i,
      // "prints/outputs/displays" + flood info (= coding wrapper)
      /(?:prints?|outputs?|displays?|logs?|console)\b.*\b(?:flood|evacuation|safety|baha|water level)/i,
    ];

    // ═══ CATEGORY 4: SENSITIVE DATA / TAG INJECTION ═══
    const SENSITIVE_REGEXES = [
      // API keys, env vars, passwords, credentials, database
      /(?:api\s*keys?|environment\s*variables?|env\s*var|passwords?|credentials?|secrets?|tokens?|database\s*(?:credentials?|access|connection))/i,
      // "show/give/list" + "all users/emails"
      /(?:show|give|list|display|dump|export)\b.*\b(?:all\s+)?(?:users?|emails?|accounts?|data|records?|passwords?)/i,
      // Tag injection attempts
      /<\/?system>|<\/?s>|\[\/?(inst|sys)\]|<<\/?sys>>|\{\{|\}\}|<\|(?:im_start|im_end|system|user)\|>/i,
      // Response length override
      /(?:ignore|remove|bypass|no|without|disable|lift)\b.*\b(?:character|response|output|length|word)\s*(?:limit|cap|restriction|maximum)/i,
      // "longer/unlimited/detailed response"
      /(?:longer|unlimited|extended|full|detailed|comprehensive|complete|verbose)\s+(?:response|answer|reply|output|explanation)/i,
    ];

    // ═══ CATEGORY 5: TOOL BYPASS ═══
    const TOOL_BYPASS_REGEXES = [
      // "don't/do not/without/skip/avoid" + "use/using/check/look" + "tools/data/database"
      /(?:don'?t|do not|without|skip|avoid|no need to)\b.*\b(?:use|using|check|look|query|call|access)\b.*\b(?:tools?|data(?:base)?|api|system|backend)/i,
      // "just/simply" + "estimate/guess/approximate/assume"
      /(?:just|simply|only)\s+(?:estimate|guess|approximate|assume|imagine|infer|predict|make up)/i,
    ];

    // Run all regex categories
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
