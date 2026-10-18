const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(50),
    email: z.email("Email not valid").min(10, "Email is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(16, "Password must be less than 16 characters"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.email("Email not valid").min(10, "Email is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(16, "Password must be less than 16 characters"),
  }),
});

module.exports = { registerSchema, loginSchema };
