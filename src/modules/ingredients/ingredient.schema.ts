import { z } from "zod";

export const createIngredientSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
    abbreviation: z.string().min(1, "Abbreviation is required").max(10, "Abbreviation must be at most 10 characters"),
    glycemicIndex: z.number().min(0, "Glycemic index must be non-negative").max(100, "Glycemic index cannot exceed 100"),
    breadUnitsIn1g: z.number().positive("Bread units must be positive"),
    caloriesPer100g: z.number().nonnegative("Calories per 100g must be non-negative"),
    unit: z.string().min(1, "Unit is required").max(10, "Unit must be at most 10 characters").default("g"),
  }).strict()
});

export const updateIngredientSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  }),
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").max(100, "Name must be at most 100 characters").optional(),
    abbreviation: z.string().min(1, "Abbreviation cannot be empty").max(10, "Abbreviation must be at most 10 characters").optional(),
    glycemicIndex: z.number().min(0, "Glycemic index must be non-negative").max(100, "Glycemic index cannot exceed 100").optional(),
    breadUnitsIn1g: z.number().positive("Bread units must be positive").optional(),
    caloriesPer100g: z.number().nonnegative("Calories per 100g must be non-negative").optional(),
    unit: z.string().min(1, "Unit cannot be empty").max(10, "Unit must be at most 10 characters").optional(),
  }).strict().refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
  })
});

export const ingredientIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  })
});

