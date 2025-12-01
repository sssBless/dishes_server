import Fastify, {
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from 'fastify';
import {JWT} from 'fastify-jwt';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import userRoutes from './modules/user/user.route.js';
import dishRoutes from './modules/dishes/dish.route.js';
import ingredientRoutes from './modules/ingredients/ingredient.route.js';

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
  const server = Fastify({logger: true}).withTypeProvider<ZodTypeProvider>();

  server.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Register multipart for file uploads
  server.register(multipart);

  // Register static file serving
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const resourcesPath = path.join(__dirname, '../resources');
  
  // Ensure resources directory exists (async, but don't block)
  fs.mkdir(resourcesPath, { recursive: true }).catch(() => {});
  fs.mkdir(path.join(resourcesPath, 'dishes'), { recursive: true }).catch(() => {});
  
  server.register(fastifyStatic, {
    root: resourcesPath,
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
        return reply.code(401).send({
          message: 'Unauthorized',
          error: err.message || 'Invalid or missing token'
        });
      }
    }
  );

  server.get('/healthcheck', async function () {
    return {status: 'OK'};
  });

  // Hook to handle empty JSON bodies for favorite endpoints (before validation)
  server.addHook(
    'preValidation',
    (
      request: FastifyRequest,
      reply: FastifyReply,
      next: HookHandlerDoneFunction
    ) => {
      // Allow empty body for favorite endpoints
      if ((request.url.includes('/favorite') && (request.method === 'POST' || request.method === 'DELETE'))) {
        const contentType = request.headers['content-type'];
        const contentLength = request.headers['content-length'];
        
        if (contentType?.includes('application/json') && (contentLength === '0' || contentLength === undefined)) {
          // Remove Content-Type header for empty bodies to avoid Fastify validation error
          delete request.headers['content-type'];
        }
      }
      return next();
    }
  );

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
  return server;
}

export default buildServer;
