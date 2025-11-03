import Report from '../models/Report.js';

const RATE_LIMIT_MINUTES = parseInt(process.env.REPORT_RATE_LIMIT_MINUTES) || 3;

// Rate limiting for report creation (DB-backed approach)
export const reportRateLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for rate limiting.'
      });
    }

    // Find the user's most recent report
    const lastReport = await Report.findOne({ 
      reporter: req.user._id 
    }).sort({ createdAt: -1 });

    if (lastReport) {
      const timeSinceLastReport = Date.now() - lastReport.createdAt.getTime();
      const rateLimitMs = RATE_LIMIT_MINUTES * 60 * 1000; // Convert to milliseconds

      if (timeSinceLastReport < rateLimitMs) {
        const remainingTime = Math.ceil((rateLimitMs - timeSinceLastReport) / 1000 / 60);
        
        return res.status(429).json({
          success: false,
          message: `Rate limit exceeded. Please wait ${remainingTime} minute(s) before submitting another report.`,
          rateLimitInfo: {
            limitMinutes: RATE_LIMIT_MINUTES,
            remainingMinutes: remainingTime,
            lastReportTime: lastReport.createdAt,
            nextAllowedTime: new Date(lastReport.createdAt.getTime() + rateLimitMs)
          }
        });
      }
    }

    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Continue if rate limiting fails (fail-open approach)
    next();
  }
};

// General API rate limiting (in-memory approach for simplicity)
const requestCounts = new Map();
const REQUEST_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per 15 minutes

export const generalRateLimit = (req, res, next) => {
  try {
    // Use IP address as identifier, or user ID if authenticated
    const identifier = req.user?._id?.toString() || req.ip || 'anonymous';
    const now = Date.now();
    
    // Clean up old entries
    for (const [key, data] of requestCounts.entries()) {
      if (now - data.windowStart > REQUEST_WINDOW_MS) {
        requestCounts.delete(key);
      }
    }

    // Get or create request count for this identifier
    let requestData = requestCounts.get(identifier);
    
    if (!requestData || now - requestData.windowStart > REQUEST_WINDOW_MS) {
      // New window
      requestData = {
        count: 1,
        windowStart: now
      };
    } else {
      // Existing window
      requestData.count++;
    }

    requestCounts.set(identifier, requestData);

    // Check if limit exceeded
    if (requestData.count > MAX_REQUESTS_PER_WINDOW) {
      const resetTime = new Date(requestData.windowStart + REQUEST_WINDOW_MS);
      
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        rateLimitInfo: {
          limit: MAX_REQUESTS_PER_WINDOW,
          windowMinutes: REQUEST_WINDOW_MS / 1000 / 60,
          resetTime: resetTime
        }
      });
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW,
      'X-RateLimit-Remaining': Math.max(0, MAX_REQUESTS_PER_WINDOW - requestData.count),
      'X-RateLimit-Reset': new Date(requestData.windowStart + REQUEST_WINDOW_MS).toISOString()
    });

    next();
  } catch (error) {
    console.error('General rate limiting error:', error);
    // Continue if rate limiting fails
    next();
  }
};

// Cleanup function to be called periodically
export const cleanupRateLimitData = () => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.windowStart > REQUEST_WINDOW_MS) {
      requestCounts.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired rate limit entries`);
  }
};

// Set up periodic cleanup (every 30 minutes)
setInterval(cleanupRateLimitData, 30 * 60 * 1000);
