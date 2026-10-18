const express = require("express");
const { authLimiter } = require("../middlewares/rateLimiter.middleware");
const { protect } = require("../middlewares/auth.middleware");
const {
  register,
  login,
  refresh,
  logout,
} = require("../services/auth.service");
const {
  registerSchema,
  loginSchema,
} = require("../utils/validators/auth.validator");
const router = express.Router();
const validate = require("../middlewares/validate.middleware");
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & Authorization
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Mohamed Farag }
 *               email: { type: string, example: farag@test.com }
 *               password: { type: string, example: 12345678 }
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Email exists
 */
router.post("/register", validate(registerSchema), authLimiter, register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: farag@test.com }
 *               password: { type: string, example: 12345678 }
 *     responses:
 *       200:
 *         description: Returns accessToken + sets refreshToken in HttpOnly Cookie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *                 user: { type: object }
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validate(loginSchema), authLimiter, login);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Get new access token from HttpOnly Cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token
 */
router.post("/refresh", refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout and clear cookie
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post("/logout", protect, logout);

module.exports = router;
