import { hashPassword } from "../../utils/hash.js";
import prisma from "../../utils/prisma.js";

export interface CreateUserInput {
    email: string;
    username: string;
    password: string;
}

export interface UpdateUserInput {
    email?: string;
    username?: string;
    password?: string;
}

export default class UserService {
    public static async register(data: CreateUserInput) {
        const {password, ...rest} = data
        const {hash, salt} = hashPassword(password)

        const user = await prisma.users.create({
            data: {...rest, salt, password: hash},
            select: {
                id: true, 
                email: true,
                username: true,
                role: true
            }
        })

        return user;
    }

    public static async findUserByEmail(email: string) {
        return await prisma.users.findUnique({where: {email}})
    }

    public static async findUserById(id: number) {
        return await prisma.users.findUnique({where: {id}})
    }

    public static async getAllUsers() {
        return prisma.users.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        })
    }

    public static async getUserById(id: number) {
        return prisma.users.findUnique({
            where: {id},
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                dishes: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        status: true,
                        createdAt: true
                    }
                }
            }
        })
    }

    public static async updateUser(id: number, data: UpdateUserInput) {
        let updateData: any = {...data};
        
        if (data.password) {
            const {hash, salt} = hashPassword(data.password);
            updateData.password = hash;
            updateData.salt = salt;
        }
        
        updateData.updatedAt = new Date();

        return await prisma.users.update({
            where: {id},
            data: updateData,
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        })
    }

    public static async deleteUser(id: number) {
        return await prisma.users.delete({
            where: {id}
        })
    }

    public static async changeUserRole(id: number, role: 'ADMIN' | 'USER') {
        return await prisma.users.update({
            where: {id},
            data: {
                role,
                updatedAt: new Date()
            },
            select: {
                id: true,
                email: true,
                username: true,
                role: true
            }
        })
    }
}