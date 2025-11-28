import {FastifyReply, FastifyRequest} from 'fastify';
import UserService, {CreateUserInput, UpdateUserInput} from './user.service.js';
import {verifyPassword} from '../../utils/hash.js';
import RefreshTokenService from './refreshToken.service.js';

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateUserRequestBody extends UpdateUserInput {}

export interface ChangeRoleInput {
  role: 'ADMIN' | 'USER';
}

interface RefreshTokenInput {
  refreshToken: string;
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
    try {
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
        const payload = {
          id: rest.id,
          email: rest.email,
          username: rest.username,
          role: rest.role,
        };
        const token = request.jwt.sign(payload, {expiresIn: '1h'});
        const {refreshToken} = await RefreshTokenService.create(rest.id);
        return reply.code(200).send({accessToken: token, refreshToken});
      }

      return reply.code(401).send({
        message: 'Invalid email or password',
      });
    } catch (err: any) {
      console.error(err);
      return reply.code(500).send({message: 'Internal server error'});
    }
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

  public static async refreshToken(
    request: FastifyRequest<{Body: RefreshTokenInput}>,
    reply: FastifyReply
  ) {
    try {
      const {refreshToken} = request.body;
      const result = await RefreshTokenService.rotate(refreshToken);
      const {user, refreshToken: newRefreshToken} = result;
      const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      };
      const accessToken = request.jwt.sign(payload, {expiresIn: '1h'});
      return reply.code(200).send({accessToken, refreshToken: newRefreshToken});
    } catch (err: any) {
      console.error(err);
      return reply.code(401).send({message: 'Invalid refresh token'});
    }
  }

  public static async logout(
    request: FastifyRequest<{Body: RefreshTokenInput}>,
    reply: FastifyReply
  ) {
    try {
      const {refreshToken} = request.body;
      await RefreshTokenService.revoke(refreshToken);
      return reply.code(200).send({message: 'Logged out'});
    } catch (err: any) {
      console.error(err);
      return reply.code(500).send({message: 'Failed to logout'});
    }
  }
}
