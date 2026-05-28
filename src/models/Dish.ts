import mongoose from "mongoose";

const dishIngredientSchema = new mongoose.Schema(
  {
    ingredientId: { type: Number, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "g" },
  },
  { _id: false }
);

const dishSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String, default: null },
  recipe: { type: String, default: null },
  cookingTime: { type: Number, default: null },
  image: { type: String, default: null },
  authorId: { type: Number, required: true, index: true },
  status: {
    type: String,
    enum: ["PENDING", "REJECTED", "ACCEPTED"],
    default: "PENDING",
  },
  ingredients: { type: [dishIngredientSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Dish = mongoose.model("Dish", dishSchema);
