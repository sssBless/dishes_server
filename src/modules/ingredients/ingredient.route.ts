import {FastifyInstance} from "fastify";
import IngredientController from "./ingredient.controller.js";
import {
  createIngredientSchema,
  updateIngredientSchema,
  ingredientIdSchema
} from "./ingredient.schema.js";

async function ingredientRoutes(server: FastifyInstance) {
    server.get('/', {
      preHandler: [server.authenticate],
      handler: IngredientController.getAllIngredients 
    });
    
    server.post('/', {
      schema: createIngredientSchema,
      preHandler: [server.authenticate],
      handler: IngredientController.createIngredient 
    });
    
    server.get('/:id', {
      schema: ingredientIdSchema,
      preHandler: [server.authenticate],
      handler: IngredientController.getIngredientById 
    });
    
    server.patch('/:id', {
      schema: updateIngredientSchema,
      preHandler: [server.authenticate],
      handler: IngredientController.updateIngredient 
    });
    
    server.delete('/:id', {
      schema: ingredientIdSchema,
      preHandler: [server.authenticate],
      handler: IngredientController.deleteIngredient 
    });
}

export default ingredientRoutes;

