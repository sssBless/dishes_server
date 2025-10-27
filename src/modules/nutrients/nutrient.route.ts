import {FastifyInstance} from "fastify";
import NutrientController from "./nutrient.controller.js";
import {
  createNutrientSchema,
  updateNutrientSchema,
  nutrientIdSchema
} from "./nutrient.schema.js";

async function nutrientRoutes(server: FastifyInstance) {
    server.get('/', {
      preHandler: [server.authenticate],
      handler: NutrientController.getAllNutrients 
    });
    
    server.post('/', {
      schema: createNutrientSchema,
      preHandler: [server.authenticate],
      handler: NutrientController.createNutrient 
    });
    
    server.get('/:id', {
      schema: nutrientIdSchema,
      preHandler: [server.authenticate],
      handler: NutrientController.getNutrientById 
    });
    
    server.get('/:id/ingredients', {
      schema: nutrientIdSchema,
      preHandler: [server.authenticate],
      handler: NutrientController.getNutrientWithIngredients 
    });
    
    server.patch('/:id', {
      schema: updateNutrientSchema,
      preHandler: [server.authenticate],
      handler: NutrientController.updateNutrient 
    });
    
    server.delete('/:id', {
      schema: nutrientIdSchema,
      preHandler: [server.authenticate],
      handler: NutrientController.deleteNutrient 
    });
}

export default nutrientRoutes;

