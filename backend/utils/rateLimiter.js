const rateLimit = require('express-rate-limit');

// general routes
const rateLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 100,
    message: { status: 'error', message: 'Too many requests, try again after 2 minutes' },
});

// stricter for auth routes — prevent brute force
const authRateLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 10, // only 10 attempts per 15 mins
    message: { status: 'error', message: 'Too many login attempts, try again after 2 minutes' },
});

module.exports = { rateLimiter, authRateLimiter };