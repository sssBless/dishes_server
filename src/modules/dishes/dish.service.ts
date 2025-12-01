import prisma from "../../utils/prisma.js";

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
    private static computeNutrition(dish: any) {
        let totalCalories = 0;
        let totalWeight = 0;
        let weightedGi = 0;
        let totalBreadUnits = 0;

        for (const di of dish.ingredients) {
            const ingredient = di.ingredient;
            const unit = di.unit || 'g';
            const quantity = di.quantity || 0;

            let grams = 0;
            if (unit === 'g' || unit === 'гр' || unit.toLowerCase() === 'g') {
                grams = quantity;
            } else if (unit === 'кг') {
                grams = quantity * 1000;
            } else if (unit === 'мл') {
                const density = ingredient.densityGPerMl ?? 1;
                grams = quantity * density;
            } else if (unit === 'шт') {
                const gramsPerPiece = ingredient.gramsPerPiece ?? 0;
                grams = gramsPerPiece * quantity;
            } else if (unit === 'ст.л.') {
                grams = quantity * 15;
            } else if (unit === 'ч.л.') {
                grams = quantity * 5;
            } else if (unit === 'стакан') {
                grams = quantity * 200;
            } else {
                grams = quantity;
            }

            if (grams <= 0) continue;

            totalWeight += grams;
            weightedGi += (ingredient.glycemicIndex || 0) * grams;
            totalBreadUnits += (ingredient.breadUnitsIn1g || 0) * grams;

            // calories: prefer calories per piece if unit is piece and provided
            if (unit === 'шт' && ingredient.caloriesPerPiece != null) {
                totalCalories += ingredient.caloriesPerPiece * quantity;
            } else {
                const cals100 = ingredient.caloriesPer100g || 0;
                totalCalories += (cals100 * grams) / 100;
            }
        }

        const avgGi = totalWeight > 0 ? weightedGi / totalWeight : 0;
        return {
            calories: Math.round(totalCalories),
            glycemicIndex: Math.round(avgGi),
            totalBreadUnits: Math.round(totalBreadUnits * 100) / 100
        };
    }

    public static async createDish(data: CreateDishInput) {
        const {ingredients, ...rest} = data;
        
        const dish = await prisma.dishes.create({
            data: {
                ...rest,
                ingredients: {
                    create: ingredients || []
                }
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    }
                },
                ingredients: {
                    include: {
                        ingredient: true
                    }
                }
            }
        });

        // Transform image path to full URL or keep emoji as is
        const imageUrl = dish.image 
            ? (dish.image.startsWith('dishes/') ? `/images/${dish.image}` : dish.image) // If it's a file path, add /images/, otherwise keep as is (for emoji)
            : null;
        return {
            ...dish,
            imageUrl,
            nutrition: DishService.computeNutrition(dish)
        };
    }

    public static async getAllDishes(filters?: {
        status?: 'PENDING' | 'REJECTED' | 'ACCEPTED';
        authorId?: number;
    }) {
        const dishes = await prisma.dishes.findMany({
            where: filters,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                ingredients: {
                    include: {
                        ingredient: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform image paths to full URLs or keep emoji as is
        return dishes.map(dish => {
            const imageUrl = dish.image 
                ? (dish.image.startsWith('dishes/') ? `/images/${dish.image}` : dish.image) // If it's a file path, add /images/, otherwise keep as is (for emoji)
                : null;
            return {
                ...dish,
                imageUrl,
                nutrition: DishService.computeNutrition(dish)
            };
        });
    }

    public static async getDishById(id: number) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid dish ID');
        }
        
        const dish = await prisma.dishes.findUnique({
            where: {id},
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                ingredients: {
                    include: {
                        ingredient: true
                    }
                }
            }
        });

        if (!dish) return null;

        // Transform image path to full URL or keep emoji as is
        const imageUrl = dish.image 
            ? (dish.image.startsWith('dishes/') ? `/images/${dish.image}` : dish.image) // If it's a file path, add /images/, otherwise keep as is (for emoji)
            : null;
        return {
            ...dish,
            imageUrl,
            nutrition: DishService.computeNutrition(dish)
        };
    }

    public static async updateDish(id: number, data: UpdateDishInput) {
        const dataToUpdate: any = {};
        if (data.name !== undefined) dataToUpdate.name = data.name;
        if (data.description !== undefined) dataToUpdate.description = data.description;
        if (data.recipe !== undefined) dataToUpdate.recipe = data.recipe;
        if (data.cookingTime !== undefined) dataToUpdate.cookingTime = data.cookingTime;
        if (data.status !== undefined) dataToUpdate.status = data.status;
        if (data.image !== undefined) dataToUpdate.image = data.image;
        dataToUpdate.updatedAt = new Date();

        const dish = await prisma.dishes.update({
            where: {id},
            data: dataToUpdate,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                ingredients: {
                    include: {
                        ingredient: true
                    }
                }
            }
        });

        // Transform image path to full URL or keep emoji as is
        const imageUrl = dish.image 
            ? (dish.image.startsWith('dishes/') ? `/images/${dish.image}` : dish.image) // If it's a file path, add /images/, otherwise keep as is (for emoji)
            : null;
        return {
            ...dish,
            imageUrl,
            nutrition: DishService.computeNutrition(dish)
        };
    }

    public static async updateDishImage(id: number, imagePath: string) {
        const dish = await prisma.dishes.update({
            where: {id},
            data: {
                image: imagePath,
                updatedAt: new Date()
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                ingredients: {
                    include: {
                        ingredient: true
                    }
                }
            }
        });

        // Transform image path to full URL (updateDishImage always receives a file path)
        return {
            ...dish,
            imageUrl: `/images/${dish.image}`,
            nutrition: DishService.computeNutrition(dish)
        };
    }

    public static async deleteDish(id: number) {
        return await prisma.dishes.delete({
            where: {id}
        });
    }

    public static async updateDishIngredients(id: number, ingredients: DishIngredientInput[]) {
        // Delete existing ingredients
        await prisma.dishIngredients.deleteMany({
            where: {dishId: id}
        });

        // Create new ingredients
        const dish = await prisma.dishes.update({
            where: {id},
            data: {
                ingredients: {
                    create: ingredients
                },
                updatedAt: new Date()
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                ingredients: {
                    include: {
                        ingredient: true
                    }
                }
            }
        });

        // Transform image path to full URL or keep emoji as is
        const imageUrl = dish.image 
            ? (dish.image.startsWith('dishes/') ? `/images/${dish.image}` : dish.image) // If it's a file path, add /images/, otherwise keep as is (for emoji)
            : null;
        return {
            ...dish,
            imageUrl,
            nutrition: DishService.computeNutrition(dish)
        };
    }

    public static async changeDishStatus(id: number, status: 'PENDING' | 'REJECTED' | 'ACCEPTED') {
        const dish = await prisma.dishes.update({
            where: {id},
            data: {
                status,
                updatedAt: new Date()
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                ingredients: {
                    include: {
                        ingredient: true
                    }
                }
            }
        });

        // Transform image path to full URL or keep emoji as is
        const imageUrl = dish.image 
            ? (dish.image.startsWith('dishes/') ? `/images/${dish.image}` : dish.image) // If it's a file path, add /images/, otherwise keep as is (for emoji)
            : null;
        return {
            ...dish,
            imageUrl,
            nutrition: DishService.computeNutrition(dish)
        };
    }

    public static async addToFavorites(userId: number, dishId: number) {
        // Check if dish exists
        const dish = await prisma.dishes.findUnique({where: {id: dishId}});
        if (!dish) {
            throw new Error('Dish not found');
        }

        // Check if already in favorites
        const existing = await prisma.favoriteDishes.findUnique({
            where: {
                userId_dishId: {
                    userId,
                    dishId
                }
            }
        });

        if (existing) {
            return {message: 'Dish already in favorites'};
        }

        await prisma.favoriteDishes.create({
            data: {
                userId,
                dishId
            }
        });

        return {message: 'Dish added to favorites'};
    }

    public static async removeFromFavorites(userId: number, dishId: number) {
        await prisma.favoriteDishes.deleteMany({
            where: {
                userId,
                dishId
            }
        });

        return {message: 'Dish removed from favorites'};
    }

    public static async getFavoriteDishes(userId: number) {
        const favorites = await prisma.favoriteDishes.findMany({
            where: {userId},
            include: {
                dish: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                email: true
                            }
                        },
                        ingredients: {
                            include: {
                                ingredient: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Filter out any favorites where the dish was deleted
        return favorites
            .filter(fav => fav.dish != null)
            .map(fav => {
                const imageUrl = fav.dish!.image 
                    ? (fav.dish!.image.startsWith('dishes/') ? `/images/${fav.dish!.image}` : fav.dish!.image) // If it's a file path, add /images/, otherwise keep as is (for emoji)
                    : null;
                return {
                    ...fav.dish!,
                    imageUrl,
                    nutrition: DishService.computeNutrition(fav.dish!)
                };
            });
    }

    public static async isFavorite(userId: number, dishId: number): Promise<boolean> {
        const favorite = await prisma.favoriteDishes.findUnique({
            where: {
                userId_dishId: {
                    userId,
                    dishId
                }
            }
        });

        return !!favorite;
    }
}

