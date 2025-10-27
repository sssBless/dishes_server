import {FastifyInstance} from "fastify";
import IngredientController from "./ingredient.controller.js";
import {
  createIngredientSchema,
  updateIngredientSchema,
  ingredientIdSchema,
  addNutrientSchema,
  updateIngredientNutrientSchema,
  removeNutrientSchema
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
    
    // Nutrient management
    server.post('/:id/nutrients', {
      schema: addNutrientSchema,
      preHandler: [server.authenticate],
      handler: IngredientController.addNutrient 
    });
    
    server.patch('/:id/nutrients/:nutrientId', {
      schema: updateIngredientNutrientSchema,
      preHandler: [server.authenticate],
      handler: IngredientController.updateNutrient 
    });
    
    server.delete('/:id/nutrients/:nutrientId', {
      schema: removeNutrientSchema,
      preHandler: [server.authenticate],
      handler: IngredientController.removeNutrient 
    });
}

export default ingredientRoutes;

