import { z } from "zod";

export const createNutrientSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
    unit: z.string().min(1, "Unit is required").max(10, "Unit must be at most 10 characters").default("g"),
  }).strict()
});

export const updateNutrientSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  }),
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").max(100, "Name must be at most 100 characters").optional(),
    unit: z.string().min(1, "Unit cannot be empty").max(10, "Unit must be at most 10 characters").optional(),
  }).strict().refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
  })
});

export const nutrientIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  })
});

