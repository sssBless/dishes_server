import prisma from "../../utils/prisma.js";

export interface CreateIngredientInput {
    name: string;
    abbreviation: string;
    glycemicIndex: number;
    breadUnitsIn1g: number;
    caloriesPer100g: number;
    unit?: string;
    gramsPerPiece?: number;
    caloriesPerPiece?: number;
    densityGPerMl?: number;
}

export interface UpdateIngredientInput {
    name?: string;
    abbreviation?: string;
    glycemicIndex?: number;
    breadUnitsIn1g?: number;
    caloriesPer100g?: number;
    unit?: string;
    gramsPerPiece?: number;
    caloriesPerPiece?: number;
    densityGPerMl?: number;
}

export default class IngredientService {
    public static async createIngredient(data: CreateIngredientInput) {
        const ingredientData: any = {
            name: data.name,
            abbreviation: data.abbreviation,
            glycemicIndex: data.glycemicIndex,
            breadUnitsIn1g: data.breadUnitsIn1g,
            caloriesPer100g: data.caloriesPer100g,
            unit: data.unit || 'g',
            gramsPerPiece: data.gramsPerPiece,
            caloriesPerPiece: data.caloriesPerPiece,
            densityGPerMl: data.densityGPerMl
        };
        
        const ingredient = await prisma.ingredients.create({
            data: ingredientData
        });

        return ingredient;
    }

    public static async getAllIngredients() {
        return prisma.ingredients.findMany({
            orderBy: {
                name: 'asc'
            }
        });
    }

    public static async getIngredientById(id: number) {
        return prisma.ingredients.findUnique({
            where: {id}
        });
    }

    public static async getIngredientByName(name: string) {
        return prisma.ingredients.findUnique({
            where: {name}
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

}

