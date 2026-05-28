import crypto from 'crypto';
import { getNextId } from '../../utils/getNextId.js';
import { RefreshToken } from '../../models/RefreshToken.js';
import { User } from '../../models/User.js';

const REFRESH_TOKEN_TTL_DAYS = parseInt(process.env.REFRESH_TOKEN_TTL || '7', 10);

function hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function generateToken(): string {
    return crypto.randomBytes(40).toString('hex');
}

export default class RefreshTokenService {
    public static async create(userId: number) {
        const token = generateToken();
        const tokenHash = hashToken(token);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

        await RefreshToken.deleteMany({ userId });

        const id = await getNextId('refreshToken');
        await RefreshToken.create({
            id,
            tokenHash,
            userId,
            expiresAt,
        });

        return {
            refreshToken: token,
            expiresAt,
        };
    }

    public static async rotate(refreshToken: string) {
        const tokenHash = hashToken(refreshToken);
        const existing = await RefreshToken.findOne({ tokenHash }).lean();

        if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
            throw new Error('Invalid refresh token');
        }

        await RefreshToken.updateOne({ id: existing.id }, { revokedAt: new Date() });

        const user = await User.findOne({ id: existing.userId }).lean();
        if (!user) {
            throw new Error('Invalid refresh token');
        }

        const { refreshToken: newToken } = await this.create(existing.userId);

        return {
            user,
            refreshToken: newToken,
        };
    }

    public static async revoke(refreshToken: string) {
        const tokenHash = hashToken(refreshToken);
        await RefreshToken.deleteMany({ tokenHash });
    }
}
