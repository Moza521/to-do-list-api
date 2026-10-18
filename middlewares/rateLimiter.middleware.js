const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 10, // 10 محاولات بس
  message: { message: "Too many attempts, try again after 15 min" },
  standardHeaders: true,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

module.exports = { authLimiter, generalLimiter };
