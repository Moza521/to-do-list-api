const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/roleCheck.middleware");
const userServices = require("../services/user.service");
const validate = require("../middlewares/validate.middleware");
const {
  updateMeSchema,
  updatePasswordSchema,
  adminCreateUserSchema,
  updateRoleSchema,
} = require("../utils/validators/user.validator");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User Management
 */

router.use(protect);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get my profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: My profile }
 */
router.get("/me", userServices.getMe);

/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     summary: Update my profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *     responses:
 *       200: { description: Updated }
 */
router.patch("/me", validate(updateMeSchema), userServices.updateMe);

/**
 * @swagger
 * /api/v1/users/update-password:
 *   patch:
 *     summary: Update my password
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: Password updated }
 */
router.patch(
  "/update-password",
  validate(updatePasswordSchema),
  userServices.updatePassword,
);

// Admin Only
router.use(authorize("ADMIN"));

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (Admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Users list }
 *   post:
 *     summary: Admin create user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [USER, ADMIN] }
 *     responses:
 *       201: { description: User created }
 */
router
  .route("/")
  .get(userServices.getAllUsers)
  .post(validate(adminCreateUserSchema), userServices.adminCreateUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by id (Admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: User found } }
 *   delete:
 *     summary: Delete user (Admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 204: { description: Deleted } }
 */
router
  .route("/:id")
  .get(userServices.getUserById)
  .delete(userServices.deleteUser);

/**
 * @swagger
 * /api/v1/users/{id}/role:
 *   patch:
 *     summary: Update user role (Admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [USER, ADMIN] }
 *     responses: { 200: { description: Role updated } }
 */
router.patch(
  "/:id/role",
  validate(updateRoleSchema),
  userServices.updateUserRole,
);

module.exports = router;
