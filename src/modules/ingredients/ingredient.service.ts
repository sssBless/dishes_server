import { getNextId } from "../../utils/getNextId.js";
import { Ingredient } from "../../models/Ingredient.js";

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
        const id = await getNextId("ingredient");
        const ingredient = await Ingredient.create({
            id,
            name: data.name,
            abbreviation: data.abbreviation,
            glycemicIndex: data.glycemicIndex,
            breadUnitsIn1g: data.breadUnitsIn1g,
            caloriesPer100g: data.caloriesPer100g,
            unit: data.unit || "g",
            gramsPerPiece: data.gramsPerPiece ?? null,
            caloriesPerPiece: data.caloriesPerPiece ?? null,
            densityGPerMl: data.densityGPerMl ?? null,
        });

        return ingredient.toObject();
    }

    public static async getAllIngredients() {
        return Ingredient.find().sort({ name: 1 }).lean();
    }

    public static async getIngredientById(id: number) {
        return Ingredient.findOne({ id }).lean();
    }

    public static async getIngredientByName(name: string) {
        return Ingredient.findOne({ name }).lean();
    }

    public static async updateIngredient(id: number, data: UpdateIngredientInput) {
        return Ingredient.findOneAndUpdate({ id }, data, { new: true }).lean();
    }

    public static async deleteIngredient(id: number) {
        return Ingredient.deleteOne({ id });
    }
}
