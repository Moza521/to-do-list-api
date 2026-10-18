const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/roleCheck.middleware");
const taskService = require("../services/task.service");
const validate = require("../middlewares/validate.middleware");
const { createTaskSchema, updateTaskSchema } = require("../utils/validators/task.validator");

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task Management
 */

router.use(protect);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create new task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: Finish Swagger }
 *               description: { type: string, example: Finalize docs }
 *               status: { type: string, enum: [pending, in-progress, completed] }
 *               priority: { type: string, enum: [low, medium, high] }
 *     responses:
 *       201: { description: Task created }
 *   get:
 *     summary: Get my tasks
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: My tasks }
 */
router.route("/").post(validate(createTaskSchema), taskService.createTask).get(taskService.getMyTasks);

/**
 * @swagger
 * /api/v1/tasks/admin/all:
 *   get:
 *     summary: Get all tasks (Admin only)
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: All tasks }
 *       403: { description: Not authorized }
 */
router.get("/admin/all", authorize("ADMIN"), taskService.getAllTasksAdmin);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get single task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task found }
 *       404: { description: Task not found }
 *   patch:
 *     summary: Update task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               status: { type: string, enum: [pending, in-progress, completed] }
 *               priority: { type: string, enum: [low, medium, high] }
 *     responses:
 *       200: { description: Task updated }
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 */
router
  .route("/:id")
  .get(taskService.getTask)
  .patch(validate(updateTaskSchema), taskService.updateTask)
  .delete(taskService.deleteTask);

module.exports = router;
