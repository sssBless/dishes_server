import { email } from "zod";
import { hashPassword } from "../../utils/hash.js";
import prisma from "../../utils/prisma.js";

export interface CreateUserInput {
    email: string;
    username: string;
    password: string;
}

export default class UserService {
    public static async register(data: CreateUserInput) {
        const {password, ...rest} = data
        const {hash, salt} = hashPassword(password)

        const user = await prisma.users.create({
            data: {...rest, salt, password: hash}
        })

        return user;
    }

    public static async findUserByEmail(email: string) {
        return await prisma.users.findUnique({where: {email}})
    }

    public static async getAllUsers() {
        return prisma.users.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                role: true
            }
        })
    }
}