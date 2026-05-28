import mongoose from "mongoose";

const favoriteDishSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  dishId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

favoriteDishSchema.index({ userId: 1, dishId: 1 }, { unique: true });

export const FavoriteDish = mongoose.model("FavoriteDish", favoriteDishSchema);
