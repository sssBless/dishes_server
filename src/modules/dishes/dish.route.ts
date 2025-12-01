import {FastifyInstance} from "fastify";
import DishController from "./dish.controller.js";
import {
  createDishSchema,
  updateDishSchema,
  dishIdSchema,
  getAllDishesSchema,
  updateDishIngredientsSchema,
  changeStatusSchema,
  favoriteDishIdSchema
} from "./dish.schema.js";

async function dishRoutes(server: FastifyInstance) {
    server.get('/', {
      schema: getAllDishesSchema,
      preHandler: [server.authenticate],
      handler: DishController.getAllDishes 
    });
    
    server.post('/', {
      schema: createDishSchema,
      preHandler: [server.authenticate],
      handler: DishController.createDish 
    });
    
    // Favorites endpoints - must be registered BEFORE /:id route
    // Using explicit route to avoid conflict with /:id
    server.get('/favorites', {
      preHandler: [server.authenticate],
      handler: DishController.getFavoriteDishes 
    });
    
    // Routes with /:id/favorite must come before /:id
    server.get('/:id/favorite', {
      schema: favoriteDishIdSchema,
      preHandler: [server.authenticate],
      handler: DishController.checkFavorite 
    });
    
    server.post('/:id/favorite', {
      schema: favoriteDishIdSchema,
      preHandler: [server.authenticate],
      handler: DishController.addToFavorites
    });

    server.delete('/:id/favorite', {
      schema: favoriteDishIdSchema,
      preHandler: [server.authenticate],
      handler: DishController.removeFromFavorites
    });
    
    // This route should only match numeric IDs, but Fastify will match any string
    // So we validate in the controller
    server.get('/:id', {
      schema: dishIdSchema,
      preHandler: [server.authenticate],
      handler: DishController.getDishById 
    });
    
    server.patch('/:id', {
      schema: updateDishSchema,
      preHandler: [server.authenticate],
      handler: DishController.updateDish 
    });
    
    server.delete('/:id', {
      schema: dishIdSchema,
      preHandler: [server.authenticate],
      handler: DishController.deleteDish 
    });
    
    server.patch('/:id/ingredients', {
      schema: updateDishIngredientsSchema,
      preHandler: [server.authenticate],
      handler: DishController.updateDishIngredients 
    });
    
    server.patch('/:id/status', {
      schema: changeStatusSchema,
      preHandler: [server.authenticate],
      handler: DishController.changeStatus 
    });

    // Upload image endpoint
    server.post('/:id/image', {
      schema: dishIdSchema,
      preHandler: [server.authenticate],
      handler: DishController.uploadImage 
    });
}

export default dishRoutes;

