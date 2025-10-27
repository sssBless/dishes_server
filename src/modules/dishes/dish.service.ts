import prisma from "../../utils/prisma.js";

export interface CreateDishInput {
    name: string;
    description?: string;
    image?: string;
    authorId: number;
    ingredients?: DishIngredientInput[];
}

export interface UpdateDishInput {
    name?: string;
    description?: string;
    image?: string;
    status?: 'PENDING' | 'REJECTED' | 'ACCEPTED';
}

export interface DishIngredientInput {
    ingredientId: number;
    quantity: number;
}

export default class DishService {
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

        // Transform image path to full URL
        return {
            ...dish,
            imageUrl: dish.image ? `/images/${dish.image}` : null
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

        // Transform image paths to full URLs
        return dishes.map(dish => ({
            ...dish,
            imageUrl: dish.image ? `/images/${dish.image}` : null
        }));
    }

    public static async getDishById(id: number) {
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

        // Transform image path to full URL
        return {
            ...dish,
            imageUrl: dish.image ? `/images/${dish.image}` : null
        };
    }

    public static async updateDish(id: number, data: UpdateDishInput) {
        const dataToUpdate: any = {};
        if (data.name !== undefined) dataToUpdate.name = data.name;
        if (data.description !== undefined) dataToUpdate.description = data.description;
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

        // Transform image path to full URL
        return {
            ...dish,
            imageUrl: dish.image ? `/images/${dish.image}` : null
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
                        ingredient: true,
                    }
                }
            }
        });

        // Transform image path to full URL
        return {
            ...dish,
            imageUrl: `/images/${dish.image}`
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

        // Transform image path to full URL
        return {
            ...dish,
            imageUrl: dish.image ? `/images/${dish.image}` : null
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

        // Transform image path to full URL
        return {
            ...dish,
            imageUrl: dish.image ? `/images/${dish.image}` : null
        };
    }
}

