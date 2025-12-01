import {FastifyReply, FastifyRequest} from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import DishService, {CreateDishInput, UpdateDishInput, DishIngredientInput} from './dish.service.js';

export interface ChangeStatusInput {
    status: 'PENDING' | 'REJECTED' | 'ACCEPTED';
}

export default class DishController {
    public static async createDish(
        request: FastifyRequest<{Body: CreateDishInput}>,
        reply: FastifyReply
    ) {
        try {
            const dish = await DishService.createDish(request.body);
            return reply.code(201).send(dish);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async getAllDishes(
        request: FastifyRequest<{Querystring: {status?: string, authorId?: string}}>,
        reply: FastifyReply
    ) {
        try {
            const filters: any = {};
            if (request.query.status) {
                filters.status = request.query.status;
            }
            if (request.query.authorId) {
                filters.authorId = parseInt(request.query.authorId);
            }

            const dishes = await DishService.getAllDishes(filters);
            return reply.code(200).send(dishes);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async getDishById(
        request: FastifyRequest<{Params: {id: string}}>,
        reply: FastifyReply
    ) {
        try {
            // Early validation - if id is not a number, return 400 before any Prisma call
            const idParam = request.params.id;
            if (!idParam || typeof idParam !== 'string') {
                return reply.code(400).send({message: 'Dish ID is required'});
            }
            
            // Check if it's a reserved word like 'favorites'
            if (idParam === 'favorites' || idParam === 'favorite') {
                return reply.code(404).send({message: 'Dish not found'});
            }
            
            const id = parseInt(idParam);
            if (isNaN(id) || id <= 0) {
                return reply.code(400).send({message: 'Invalid dish ID - must be a positive number'});
            }
            
            const dish = await DishService.getDishById(id);
            
            if (!dish) {
                return reply.code(404).send({message: 'Dish not found'});
            }
            
            return reply.code(200).send(dish);
        } catch (err: any) {
            console.error('Error getting dish by ID:', err);
            return reply.code(500).send({message: err.message || 'Internal server error'});
        }
    }

    public static async updateDish(
        request: FastifyRequest<{Params: {id: string}, Body: UpdateDishInput}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            if (isNaN(id)) {
                return reply.code(400).send({message: 'Invalid dish ID'});
            }
            const dish = await DishService.updateDish(id, request.body);
            return reply.code(200).send(dish);
        } catch (err: any) {
            console.error('Error updating dish:', err);
            return reply.code(500).send({message: err.message || 'Internal server error'});
        }
    }

    public static async deleteDish(
        request: FastifyRequest<{Params: {id: string}}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            if (isNaN(id)) {
                return reply.code(400).send({message: 'Invalid dish ID'});
            }
            await DishService.deleteDish(id);
            return reply.code(200).send({message: 'Dish deleted successfully'});
        } catch (err: any) {
            console.error('Error deleting dish:', err);
            return reply.code(500).send({message: err.message || 'Internal server error'});
        }
    }

    public static async updateDishIngredients(
        request: FastifyRequest<{Params: {id: string}, Body: {ingredients: DishIngredientInput[]}}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            if (isNaN(id)) {
                return reply.code(400).send({message: 'Invalid dish ID'});
            }
            const dish = await DishService.updateDishIngredients(id, request.body.ingredients);
            return reply.code(200).send(dish);
        } catch (err: any) {
            console.error('Error updating dish ingredients:', err);
            return reply.code(500).send({message: err.message || 'Internal server error'});
        }
    }

    public static async changeStatus(
        request: FastifyRequest<{Params: {id: string}, Body: ChangeStatusInput}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            if (isNaN(id)) {
                return reply.code(400).send({message: 'Invalid dish ID'});
            }
            const dish = await DishService.changeDishStatus(id, request.body.status);
            return reply.code(200).send(dish);
        } catch (err: any) {
            console.error('Error changing dish status:', err);
            return reply.code(500).send({message: err.message || 'Internal server error'});
        }
    }

    public static async uploadImage(
        request: FastifyRequest<{Params: {id: string}}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            if (isNaN(id)) {
                return reply.code(400).send({message: 'Invalid dish ID'});
            }
            
            // Check if dish exists
            const dish = await DishService.getDishById(id);
            if (!dish) {
                return reply.code(404).send({message: 'Dish not found'});
            }

            // Handle file upload
            const data = await request.file();
            if (!data) {
                return reply.code(400).send({message: 'No file uploaded'});
            }

            // Check file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(data.mimetype)) {
                return reply.code(400).send({message: 'Invalid file type. Only images are allowed'});
            }

            // Check file size (max 5MB)
            if (data.file.readableLength > 5 * 1024 * 1024) {
                return reply.code(400).send({message: 'File too large. Maximum size is 5MB'});
            }

            // Create unique filename
            const fileExtension = path.extname(data.filename);
            const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
            const dishesDir = path.join(process.cwd(), 'resources', 'dishes');
            
            // Ensure dishes directory exists
            try {
                await fs.mkdir(dishesDir, { recursive: true });
            } catch (err) {
                // Directory might already exist, ignore error
            }
            
            const uploadPath = path.join(dishesDir, uniqueFilename);

            // Save file
            const buffer = await data.toBuffer();
            await fs.writeFile(uploadPath, buffer);

            // Update dish with image path
            const imagePath = `dishes/${uniqueFilename}`;
            const updatedDish = await DishService.updateDishImage(id, imagePath);

            // Delete old image if exists
            if (dish.image) {
                const oldImagePath = path.join(process.cwd(), 'resources', dish.image);
                try {
                    await fs.unlink(oldImagePath);
                } catch (err) {
                    console.warn('Could not delete old image:', err);
                }
            }

            return reply.code(200).send(updatedDish);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async addToFavorites(
        request: FastifyRequest<{Params: {id: string}}>,
        reply: FastifyReply
    ) {
        try {
            const dishId = parseInt(request.params.id);
            const userId = (request.user as any)?.id;
            
            if (isNaN(dishId) || !userId) {
                return reply.code(400).send({message: 'Invalid dish ID or user ID'});
            }
            
            const result = await DishService.addToFavorites(userId, dishId);
            return reply.code(200).send(result);
        } catch (err: any) {
            console.error('Error adding to favorites:', err);
            if (err.message === 'Dish not found') {
                return reply.code(404).send({message: err.message});
            }
            return reply.code(500).send({message: err.message || 'Internal server error'});
        }
    }

    public static async removeFromFavorites(
        request: FastifyRequest<{Params: {id: string}}>,
        reply: FastifyReply
    ) {
        try {
            const dishId = parseInt(request.params.id);
            const userId = (request.user as any)?.id;
            
            if (isNaN(dishId) || !userId) {
                return reply.code(400).send({message: 'Invalid dish ID or user ID'});
            }
            
            const result = await DishService.removeFromFavorites(userId, dishId);
            return reply.code(200).send(result);
        } catch (err: any) {
            console.error('Error removing from favorites:', err);
            return reply.code(500).send({message: err.message || 'Internal server error'});
        }
    }

    public static async getFavoriteDishes(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const userId = (request.user as any)?.id;
            if (!userId) {
                return reply.code(400).send({message: 'User ID is required'});
            }
            const dishes = await DishService.getFavoriteDishes(userId);
            return reply.code(200).send(dishes);
        } catch (err: any) {
            console.error('Error getting favorite dishes:', err);
            return reply.code(500).send({message: err.message || 'Internal server error'});
        }
    }

    public static async checkFavorite(
        request: FastifyRequest<{Params: {id: string}}>,
        reply: FastifyReply
    ) {
        try {
            const dishId = parseInt(request.params.id);
            const userId = (request.user as any)?.id;
            
            if (isNaN(dishId) || !userId) {
                return reply.code(400).send({message: 'Invalid dish ID or user ID'});
            }
            
            const isFavorite = await DishService.isFavorite(userId, dishId);
            return reply.code(200).send({isFavorite});
        } catch (err: any) {
            console.error('Error checking favorite:', err);
            return reply.code(500).send({message: err.message || 'Internal server error'});
        }
    }
}

