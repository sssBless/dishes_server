import { hashPassword } from "../../utils/hash.js";
import { getNextId } from "../../utils/getNextId.js";
import { User } from "../../models/User.js";
import { Dish } from "../../models/Dish.js";
import { RefreshToken } from "../../models/RefreshToken.js";
import { FavoriteDish } from "../../models/FavoriteDish.js";

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
        const id = await getNextId("user");

        const user = await User.create({
            id,
            ...rest,
            salt,
            password: hash,
        });

        return {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        };
    }

    public static async findUserByEmail(email: string) {
        return User.findOne({email}).lean();
    }

    public static async findUserById(id: number) {
        return User.findOne({id}).lean();
    }

    public static async getAllUsers() {
        const users = await User.find()
            .select("id email username role createdAt updatedAt")
            .lean();
        return users;
    }

    public static async getUserById(id: number) {
        const user = await User.findOne({id}).lean();
        if (!user) return null;

        const dishes = await Dish.find({ authorId: id })
            .select("id name description status createdAt")
            .lean();

        return { ...user, dishes };
    }

    public static async updateUser(id: number, data: UpdateUserInput) {
        const updateData: any = { ...data, updatedAt: new Date() };

        if (data.password) {
            const {hash, salt} = hashPassword(data.password);
            updateData.password = hash;
            updateData.salt = salt;
        }

        const user = await User.findOneAndUpdate({ id }, updateData, { new: true })
            .select("id email username role createdAt updatedAt")
            .lean();

        return user;
    }

    public static async deleteUser(id: number) {
        await FavoriteDish.deleteMany({ userId: id });
        await RefreshToken.deleteMany({ userId: id });
        await Dish.deleteMany({ authorId: id });
        return User.deleteOne({ id });
    }

    public static async changeUserRole(id: number, role: 'ADMIN' | 'USER') {
        const user = await User.findOneAndUpdate(
            { id },
            { role, updatedAt: new Date() },
            { new: true }
        )
            .select("id email username role")
            .lean();

        return user;
    }
}
