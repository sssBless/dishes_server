import {FastifyReply, FastifyRequest} from 'fastify';
import NutrientService, {CreateNutrientInput, UpdateNutrientInput} from './nutrient.service.js';

export default class NutrientController {
    public static async createNutrient(
        request: FastifyRequest<{Body: CreateNutrientInput}>,
        reply: FastifyReply
    ) {
        try {
            const nutrient = await NutrientService.createNutrient(request.body);
            return reply.code(201).send(nutrient);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async getAllNutrients(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const nutrients = await NutrientService.getAllNutrients();
            return reply.code(200).send(nutrients);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async getNutrientById(
        request: FastifyRequest<{Params: {id: string}}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            const nutrient = await NutrientService.getNutrientById(id);
            
            if (!nutrient) {
                return reply.code(404).send({message: 'Nutrient not found'});
            }
            
            return reply.code(200).send(nutrient);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async updateNutrient(
        request: FastifyRequest<{Params: {id: string}, Body: UpdateNutrientInput}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            const nutrient = await NutrientService.updateNutrient(id, request.body);
            return reply.code(200).send(nutrient);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async deleteNutrient(
        request: FastifyRequest<{Params: {id: string}}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            await NutrientService.deleteNutrient(id);
            return reply.code(200).send({message: 'Nutrient deleted successfully'});
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }

    public static async getNutrientWithIngredients(
        request: FastifyRequest<{Params: {id: string}}>,
        reply: FastifyReply
    ) {
        try {
            const id = parseInt(request.params.id);
            const nutrient = await NutrientService.getNutrientWithIngredients(id);
            
            if (!nutrient) {
                return reply.code(404).send({message: 'Nutrient not found'});
            }
            
            return reply.code(200).send(nutrient);
        } catch (err: any) {
            console.error(err);
            return reply.code(500).send(err);
        }
    }
}

