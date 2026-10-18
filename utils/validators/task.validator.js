const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

module.exports = { createTaskSchema, updateTaskSchema };