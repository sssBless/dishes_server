import {FastifyReply, FastifyRequest} from 'fastify';
import UserService, {CreateUserInput, UpdateUserInput} from './user.service.js';
import {verifyPassword} from '../../utils/hash.js';

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateUserRequestBody extends UpdateUserInput {}

export interface ChangeRoleInput {
  role: 'ADMIN' | 'USER';
}

export default class UserController {
  public static async register(
    request: FastifyRequest<{Body: CreateUserInput}>,
    reply: FastifyReply
  ) {
    try {
      const user = await UserService.register(request.body);
      return reply.code(201).send(user);
    } catch (err: any) {
      console.error(err);
      return reply.code(500).send(err);
    }
  }

  public static async login(
    request: FastifyRequest<{Body: LoginInput}>,
    reply: FastifyReply
  ) {
    const {email, password: candidate} = request.body;
    const user = await UserService.findUserByEmail(email);

    if (!user) {
      return reply.code(401).send({
        message: 'Invalid email or password',
      });
    }

    const {password: hash, salt, ...rest} = user;
    const correctPassword = verifyPassword({
      candidate,
      hash,
      salt,
    });

    if (correctPassword) {
      return {accessToken: request.jwt.sign(rest, {expiresIn: '1h'})};
    }

    return reply.code(401).send({
      message: 'Invalid email or password',
    });
  }

  public static async getAllUsers() {
    const users = await UserService.getAllUsers();
    return users;
  }

  public static async getUserById(
    request: FastifyRequest<{Params: {id: string}}>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);
      const user = await UserService.getUserById(id);
      
      if (!user) {
        return reply.code(404).send({message: 'User not found'});
      }
      
      return reply.code(200).send(user);
    } catch (err: any) {
      console.error(err);
      return reply.code(500).send(err);
    }
  }

  public static async updateUser(
    request: FastifyRequest<{Params: {id: string}, Body: UpdateUserInput}>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);
      const user = await UserService.updateUser(id, request.body);
      return reply.code(200).send(user);
    } catch (err: any) {
      console.error(err);
      return reply.code(500).send(err);
    }
  }

  public static async deleteUser(
    request: FastifyRequest<{Params: {id: string}}>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);
      await UserService.deleteUser(id);
      return reply.code(200).send({message: 'User deleted successfully'});
    } catch (err: any) {
      console.error(err);
      return reply.code(500).send(err);
    }
  }

  public static async changeRole(
    request: FastifyRequest<{Params: {id: string}, Body: ChangeRoleInput}>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);
      const user = await UserService.changeUserRole(id, request.body.role);
      return reply.code(200).send(user);
    } catch (err: any) {
      console.error(err);
      return reply.code(500).send(err);
    }
  }
}
