import { FastifyInstance } from "fastify";
import UserController from "./user.controller.js";

async function userRoutes(server: FastifyInstance) {
    server.post('/', UserController.register)
    server.post('/login', UserController.login)
    server.get('/', UserController.getAllUsers)
}

export default userRoutes