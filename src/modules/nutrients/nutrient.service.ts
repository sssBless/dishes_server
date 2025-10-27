import prisma from "../../utils/prisma.js";

export interface CreateNutrientInput {
    name: string;
    unit?: string;
}

export interface UpdateNutrientInput {
    name?: string;
    unit?: string;
}

export default class NutrientService {
    public static async createNutrient(data: CreateNutrientInput) {
        return await prisma.nutrients.create({
            data: {
                ...data,
                unit: data.unit || 'g'
            }
        });
    }

    public static async getAllNutrients() {
        return prisma.nutrients.findMany({
            orderBy: {
                name: 'asc'
            }
        });
    }

    public static async getNutrientById(id: number) {
        return prisma.nutrients.findUnique({
            where: {id}
        });
    }

    public static async getNutrientByName(name: string) {
        return prisma.nutrients.findUnique({
            where: {name}
        });
    }

    public static async updateNutrient(id: number, data: UpdateNutrientInput) {
        return await prisma.nutrients.update({
            where: {id},
            data
        });
    }

    public static async deleteNutrient(id: number) {
        return await prisma.nutrients.delete({
            where: {id}
        });
    }

    public static async getNutrientWithIngredients(id: number) {
        return prisma.nutrients.findUnique({
            where: {id},
            include: {
                ingredients: {
                    include: {
                        ingredient: true
                    }
                }
            }
        });
    }
}

