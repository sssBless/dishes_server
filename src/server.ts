import Fastify, {
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from 'fastify';
import fjwt, {JWT} from 'fastify-jwt';
import userRoutes from './modules/user/user.route.js';

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
  const server = Fastify();

  server.register(fjwt, {
    secret:
      process.env.JWT_SECRET || 'asdnalksdnkasckjasdkjndlknsalkdlknlk12312321',
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

  for (const schema of []) {
    server.addSchema(schema);
  }

  server.register(userRoutes, {prefix: 'api/users'});
  return server;
}

export default buildServer