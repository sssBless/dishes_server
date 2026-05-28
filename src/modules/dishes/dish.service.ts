import { getNextId } from "../../utils/getNextId.js";
import { Dish } from "../../models/Dish.js";
import { FavoriteDish } from "../../models/FavoriteDish.js";
import { formatDish, formatDishes } from "../../utils/dishMapper.js";
import {
  deleteCloudinaryImage,
  isCloudinaryImageUrl,
} from "../../utils/cloudinary.js";

export interface CreateDishInput {
    name: string;
    description?: string;
    recipe?: string;
    cookingTime?: number;
    image?: string;
    authorId: number;
    ingredients?: DishIngredientInput[];
}

export interface UpdateDishInput {
    name?: string;
    description?: string;
    recipe?: string;
    cookingTime?: number;
    image?: string;
    status?: 'PENDING' | 'REJECTED' | 'ACCEPTED';
}

export interface DishIngredientInput {
    ingredientId: number;
    quantity: number;
    unit?: string;
}

export default class DishService {
    public static async createDish(data: CreateDishInput) {
        const { ingredients, ...rest } = data;
        const id = await getNextId("dish");

        const dish = await Dish.create({
            id,
            ...rest,
            ingredients: (ingredients || []).map((i) => ({
                ingredientId: i.ingredientId,
                quantity: i.quantity,
                unit: i.unit || "g",
            })),
        });

        return formatDish(dish.toObject());
    }

    public static async getAllDishes(filters?: {
        status?: 'PENDING' | 'REJECTED' | 'ACCEPTED';
        authorId?: number;
    }) {
        const query: any = {};
        if (filters?.status) query.status = filters.status;
        if (filters?.authorId) query.authorId = filters.authorId;

        const dishes = await Dish.find(query).sort({ createdAt: -1 }).lean();
        return formatDishes(dishes);
    }

    public static async getDishById(id: number) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid dish ID');
        }

        const dish = await Dish.findOne({ id }).lean();
        if (!dish) return null;

        return formatDish(dish);
    }

    public static async updateDish(id: number, data: UpdateDishInput) {
        const dataToUpdate: any = { updatedAt: new Date() };
        if (data.name !== undefined) dataToUpdate.name = data.name;
        if (data.description !== undefined) dataToUpdate.description = data.description;
        if (data.recipe !== undefined) dataToUpdate.recipe = data.recipe;
        if (data.cookingTime !== undefined) dataToUpdate.cookingTime = data.cookingTime;
        if (data.status !== undefined) dataToUpdate.status = data.status;
        if (data.image !== undefined) dataToUpdate.image = data.image;

        const dish = await Dish.findOneAndUpdate({ id }, dataToUpdate, { new: true }).lean();
        if (!dish) throw new Error('Dish not found');

        return formatDish(dish);
    }

    public static async updateDishImage(id: number, imagePath: string) {
        const dish = await Dish.findOneAndUpdate(
            { id },
            { image: imagePath, updatedAt: new Date() },
            { new: true }
        ).lean();

        if (!dish) throw new Error('Dish not found');

        return formatDish(dish);
    }

    public static async deleteDish(id: number) {
        const dish = await Dish.findOne({ id }).lean();
        if (dish?.image && isCloudinaryImageUrl(dish.image)) {
            try {
                await deleteCloudinaryImage(dish.image);
            } catch (err) {
                console.warn("Could not delete Cloudinary image:", err);
            }
        }

        await FavoriteDish.deleteMany({ dishId: id });
        return Dish.deleteOne({ id });
    }

    public static async updateDishIngredients(id: number, ingredients: DishIngredientInput[]) {
        const dish = await Dish.findOneAndUpdate(
            { id },
            {
                ingredients: ingredients.map((i) => ({
                    ingredientId: i.ingredientId,
                    quantity: i.quantity,
                    unit: i.unit || "g",
                })),
                updatedAt: new Date(),
            },
            { new: true }
        ).lean();

        if (!dish) throw new Error('Dish not found');
        return formatDish(dish);
    }

    public static async changeDishStatus(id: number, status: 'PENDING' | 'REJECTED' | 'ACCEPTED') {
        const dish = await Dish.findOneAndUpdate(
            { id },
            { status, updatedAt: new Date() },
            { new: true }
        ).lean();

        if (!dish) throw new Error('Dish not found');
        return formatDish(dish);
    }

    public static async addToFavorites(userId: number, dishId: number) {
        const dish = await Dish.findOne({ id: dishId }).lean();
        if (!dish) {
            throw new Error('Dish not found');
        }

        const existing = await FavoriteDish.findOne({ userId, dishId }).lean();
        if (existing) {
            return { message: 'Dish already in favorites' };
        }

        await FavoriteDish.create({ userId, dishId });
        return { message: 'Dish added to favorites' };
    }

    public static async removeFromFavorites(userId: number, dishId: number) {
        await FavoriteDish.deleteMany({ userId, dishId });
        return { message: 'Dish removed from favorites' };
    }

    public static async getFavoriteDishes(userId: number) {
        const favorites = await FavoriteDish.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        const dishIds = favorites.map((f) => f.dishId);
        const dishes = await Dish.find({ id: { $in: dishIds } }).lean();
        const dishesById = new Map(dishes.map((d) => [d.id, d]));

        const orderedDishes = favorites
            .map((f) => dishesById.get(f.dishId))
            .filter((d): d is NonNullable<typeof d> => d != null);

        return formatDishes(orderedDishes);
    }

    public static async isFavorite(userId: number, dishId: number): Promise<boolean> {
        const favorite = await FavoriteDish.findOne({ userId, dishId }).lean();
        return !!favorite;
    }
}
