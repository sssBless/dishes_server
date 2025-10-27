import prisma from "../../utils/prisma.js";

export interface CreateIngredientInput {
    name: string;
    abbreviation: string;
    glycemicIndex: number;
    breadUnitsIn1g: number;
    nutrients?: IngredientNutrientInput[];
}

export interface UpdateIngredientInput {
    name?: string;
    abbreviation?: string;
    glycemicIndex?: number;
    breadUnitsIn1g?: number;
}

export interface IngredientNutrientInput {
    nutrientId: number;
    amountPer100g: number;
}

export default class IngredientService {
    public static async createIngredient(data: CreateIngredientInput) {
        const {nutrients, ...rest} = data;
        
        const ingredient = await prisma.ingredients.create({
            data: {
                ...rest,
                nutrients: {
                    create: nutrients || []
                }
            },
            include: {
                nutrients: {
                    include: {
                        nutrient: true
                    }
                }
            }
        });

        return ingredient;
    }

    public static async getAllIngredients() {
        return prisma.ingredients.findMany({
            include: {
                nutrients: {
                    include: {
                        nutrient: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    public static async getIngredientById(id: number) {
        return prisma.ingredients.findUnique({
            where: {id},
            include: {
                nutrients: {
                    include: {
                        nutrient: true
                    }
                }
            }
        });
    }

    public static async getIngredientByName(name: string) {
        return prisma.ingredients.findUnique({
            where: {name},
            include: {
                nutrients: {
                    include: {
                        nutrient: true
                    }
                }
            }
        });
    }

    public static async updateIngredient(id: number, data: UpdateIngredientInput) {
        return await prisma.ingredients.update({
            where: {id},
            data
        });
    }

    public static async deleteIngredient(id: number) {
        return await prisma.ingredients.delete({
            where: {id}
        });
    }

    public static async addNutrientToIngredient(ingredientId: number, nutrientId: number, amountPer100g: number) {
        return await prisma.ingredientNutrients.create({
            data: {
                ingredientId,
                nutrientId,
                amountPer100g
            },
            include: {
                nutrient: true
            }
        });
    }

    public static async updateIngredientNutrient(
        ingredientId: number,
        nutrientId: number,
        amountPer100g: number
    ) {
        return await prisma.ingredientNutrients.update({
            where: {
                ingredientId_nutrientId: {
                    ingredientId,
                    nutrientId
                }
            },
            data: {amountPer100g},
            include: {
                nutrient: true
            }
        });
    }

    public static async removeNutrientFromIngredient(ingredientId: number, nutrientId: number) {
        return await prisma.ingredientNutrients.delete({
            where: {
                ingredientId_nutrientId: {
                    ingredientId,
                    nutrientId
                }
            }
        });
    }
}

