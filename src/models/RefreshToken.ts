import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: Number, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
});

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
