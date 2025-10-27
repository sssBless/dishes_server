import Fastify, {
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from 'fastify';
import {JWT} from 'fastify-jwt';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import userRoutes from './modules/user/user.route.js';
import dishRoutes from './modules/dishes/dish.route.js';
import ingredientRoutes from './modules/ingredients/ingredient.route.js';
import nutrientRoutes from './modules/nutrients/nutrient.route.js';

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT;
  }
  export interface FastifyInstance {
    authenticate: any;
  }
}

declare module 'fastify-jwt' {
  interface FastifyJWT {
    user: {
      id: number;
      email: string;
      username: string;
      role: string;
    };
  }
}

function buildServer() {
  const server = Fastify().withTypeProvider<ZodTypeProvider>();

  // Register multipart for file uploads
  server.register(multipart);

  // Register static file serving
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  server.register(fastifyStatic, {
    root: path.join(__dirname, '../resources'),
    prefix: '/images/',
  });

  server.register(jwt, {
    secret: process.env.JWT_SECRET!,
  });

  server.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err: any) {
        return reply.send(err);
      }
    }
  );

  server.get('/healthcheck', async function () {
    return {status: 'OK'};
  });

  server.addHook(
    'preHandler',
    (
      request: FastifyRequest,
      reply: FastifyReply,
      next: HookHandlerDoneFunction
    ) => {
      request.jwt = server.jwt;
      return next();
    }
  );

  server.register(userRoutes, {prefix: '/api/users'});
  server.register(dishRoutes, {prefix: '/api/dishes'});
  server.register(ingredientRoutes, {prefix: '/api/ingredients'});
  server.register(nutrientRoutes, {prefix: '/api/nutrients'});
  return server;
}

export default buildServer;
