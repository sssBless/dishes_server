import crypto from 'crypto';
import prisma from '../../utils/prisma.js';

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

        // Remove old tokens for this user to keep only one active
        await prisma.refreshTokens.deleteMany({
            where: {
                userId,
            },
        });

        await prisma.refreshTokens.create({
            data: {
                tokenHash,
                userId,
                expiresAt,
            },
        });

        return {
            refreshToken: token,
            expiresAt,
        };
    }

    public static async rotate(refreshToken: string) {
        const tokenHash = hashToken(refreshToken);
        const existing = await prisma.refreshTokens.findUnique({
            where: { tokenHash },
            include: {
                user: true,
            },
        });

        if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
            throw new Error('Invalid refresh token');
        }

        await prisma.refreshTokens.update({
            where: { id: existing.id },
            data: {
                revokedAt: new Date(),
            },
        });

        const { refreshToken: newToken } = await this.create(existing.userId);

        return {
            user: existing.user,
            refreshToken: newToken,
        };
    }

    public static async revoke(refreshToken: string) {
        const tokenHash = hashToken(refreshToken);
        await prisma.refreshTokens.deleteMany({
            where: { tokenHash },
        });
    }
}

