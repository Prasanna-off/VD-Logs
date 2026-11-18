const rateLimit = require('express-rate-limit');

// Rate limiter for authentication endpoints: max 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts. Please try again after 15 minutes.'
    }
  }
});

module.exports = {
  authLimiter
};
