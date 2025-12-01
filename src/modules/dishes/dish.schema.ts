import { z } from "zod";

export const createDishSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
    description: z.string().max(500, "Description must be at most 500 characters").optional(),
    recipe: z.string().max(2000, "Recipe must be at most 2000 characters").optional(),
    cookingTime: z.number().int().positive("Cooking time must be positive").optional(),
    authorId: z.number().int().positive("Author ID must be a positive number"),
    ingredients: z.array(
      z.object({
        ingredientId: z.number().int().positive("Ingredient ID must be a positive number"),
        quantity: z.number().positive("Quantity must be positive"),
        unit: z.string().min(1, "Unit is required").max(20, "Unit must be at most 20 characters").optional(),
      }).strict()
    ).optional(),
    image: z.string().max(100, "Image must be at most 100 characters").optional(), // For emoji icons or image paths
  }).strict()
});

export const updateDishSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  }),
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").max(100, "Name must be at most 100 characters").optional(),
    description: z.string().max(500, "Description must be at most 500 characters").optional(),
    recipe: z.string().max(2000, "Recipe must be at most 2000 characters").optional(),
    cookingTime: z.number().int().positive("Cooking time must be positive").optional(),
    status: z.enum(["PENDING", "REJECTED", "ACCEPTED"]).optional(),
    image: z.string().max(100, "Image must be at most 100 characters").optional(), // For emoji icons or image paths
  }).strict().refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
  })
});

export const dishIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  })
});

export const getAllDishesSchema = z.object({
  querystring: z.object({
    status: z.enum(["PENDING", "REJECTED", "ACCEPTED"]).optional(),
    authorId: z.string().regex(/^\d+$/, "Author ID must be a number").optional(),
  }).strict()
});

export const updateDishIngredientsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  }),
  body: z.object({
    ingredients: z.array(
      z.object({
        ingredientId: z.number().int().positive("Ingredient ID must be a positive number"),
        quantity: z.number().positive("Quantity must be positive"),
        unit: z.string().min(1, "Unit is required").max(20, "Unit must be at most 20 characters").optional(),
      }).strict()
    ).min(1, "At least one ingredient is required"),
  }).strict()
});

export const changeStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  }),
  body: z.object({
    status: z.enum(["PENDING", "REJECTED", "ACCEPTED"] as const).refine(
      (val) => val === "PENDING" || val === "REJECTED" || val === "ACCEPTED",
      { message: "Status must be PENDING, REJECTED, or ACCEPTED" }
    ),
  }).strict()
});

export const favoriteDishIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  })
});

