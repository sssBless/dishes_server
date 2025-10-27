import {FastifyReply, FastifyRequest} from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import DishService, {CreateDishInput, UpdateDishInput, DishIngredientInput} from './dish.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            const id = parseInt(request.params.id);
            const dish = await DishService.getDishById(id);
            
            if (!dish) {
                return reply.code(404).send({message: 'Dish not found'});
            }
            
            return reply.code(200).send(dish);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async updateDish(
        request: FastifyRequest<{Params: {id: string}, Body: UpdateDishInput}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            const dish = await DishService.updateDish(id, request.body);
            return reply.code(200).send(dish);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async deleteDish(
        request: FastifyRequest<{Params: {id: string}}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            await DishService.deleteDish(id);
            return reply.code(200).send({message: 'Dish deleted successfully'});
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async updateDishIngredients(
        request: FastifyRequest<{Params: {id: string}, Body: {ingredients: DishIngredientInput[]}}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            const dish = await DishService.updateDishIngredients(id, request.body.ingredients);
            return reply.code(200).send(dish);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async changeStatus(
        request: FastifyRequest<{Params: {id: string}, Body: ChangeStatusInput}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            const dish = await DishService.changeDishStatus(id, request.body.status);
            return reply.code(200).send(dish);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async uploadImage(
        request: FastifyRequest<{Params: {id: string}}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            
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
            const uploadPath = path.join(__dirname, '../../resources/dishes', uniqueFilename);

            // Save file
            const buffer = await data.toBuffer();
            await fs.writeFile(uploadPath, buffer);

            // Update dish with image path
            const imagePath = `dishes/${uniqueFilename}`;
            const updatedDish = await DishService.updateDishImage(id, imagePath);

            // Delete old image if exists
            if (dish.image) {
                const oldImagePath = path.join(__dirname, '../../resources', dish.image);
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
}

