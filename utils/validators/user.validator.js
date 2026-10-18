const { z } = require("zod");

const updateMeSchema = z
  .object({
    name: z.string().min(3).max(50).optional(),
    email: z.email().optional(),
  })
  .strict();

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

const adminCreateUserSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

const updateRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

module.exports = {
  updateMeSchema,
  updatePasswordSchema,
  adminCreateUserSchema,
  updateRoleSchema,
};
