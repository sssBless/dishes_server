import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    email: z.email("Invalid email format"),
    username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must be at most 50 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }).strict()
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }).strict()
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  }),
  body: z.object({
    email: z.email("Invalid email format").optional(),
    username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must be at most 50 characters").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
  }).strict().refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
  })
});

export const userIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  })
});

export const changeRoleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  }),
  body: z.object({
    role: z.enum(["ADMIN", "USER"] as const).refine(
      (val) => val === "ADMIN" || val === "USER",
      { message: "Role must be either ADMIN or USER" }
    ),
  }).strict()
});

