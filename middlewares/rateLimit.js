const rateLimit = require('express-rate-limit');

// Rate limiting middleware for login and register routes
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: "Too many requests from this IP, please try again after 1 minute"
    }
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: "Too many requests from this IP, please try again after 1 minute"
    }
});

const dashboardLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        error: "Too many requests from this IP, please try again after 1 minute"
    }
});

module.exports = {
    loginLimiter,
    apiLimiter,
    dashboardLimiter
};