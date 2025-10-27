import { FastifyInstance } from "fastify";
import UserController from "./user.controller.js";
import {
  createUserSchema,
  loginSchema,
  updateUserSchema,
  userIdSchema,
  changeRoleSchema
} from "./user.schema.js";

async function userRoutes(server: FastifyInstance) {
    // Public routes
    server.post('/', { 
      schema: createUserSchema,
      handler: UserController.register 
    });
    
    server.post('/login', { 
      schema: loginSchema,
      handler: UserController.login 
    });
    
    // Protected routes
    server.get('/', {
      preHandler: [server.authenticate],
      handler: UserController.getAllUsers 
    });
    
    server.get('/:id', {
      schema: userIdSchema,
      preHandler: [server.authenticate],
      handler: UserController.getUserById 
    });
    
    server.patch('/:id', {
      schema: updateUserSchema,
      preHandler: [server.authenticate],
      handler: UserController.updateUser 
    });
    
    server.delete('/:id', {
      schema: userIdSchema,
      preHandler: [server.authenticate],
      handler: UserController.deleteUser 
    });
    
    server.patch('/:id/role', {
      schema: changeRoleSchema,
      preHandler: [server.authenticate],
      handler: UserController.changeRole 
    });
}

export default userRoutes