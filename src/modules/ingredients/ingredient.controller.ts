import {FastifyReply, FastifyRequest} from 'fastify';
import IngredientService, {CreateIngredientInput, UpdateIngredientInput} from './ingredient.service.js';

export default class IngredientController {
    public static async createIngredient(
        request: FastifyRequest<{Body: CreateIngredientInput}>,
        reply: FastifyReply
    ) {
        try {
            const ingredient = await IngredientService.createIngredient(request.body);
            return reply.code(201).send(ingredient);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async getAllIngredients(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const ingredients = await IngredientService.getAllIngredients();
            return reply.code(200).send(ingredients);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async getIngredientById(
        request: FastifyRequest<{Params: {id: string}}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            const ingredient = await IngredientService.getIngredientById(id);
            
            if (!ingredient) {
                return reply.code(404).send({message: 'Ingredient not found'});
            }
            
            return reply.code(200).send(ingredient);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async updateIngredient(
        request: FastifyRequest<{Params: {id: string}, Body: UpdateIngredientInput}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            const ingredient = await IngredientService.updateIngredient(id, request.body);
            return reply.code(200).send(ingredient);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async deleteIngredient(
        request: FastifyRequest<{Params: {id: string}}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            await IngredientService.deleteIngredient(id);
            return reply.code(200).send({message: 'Ingredient deleted successfully'});
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

}

