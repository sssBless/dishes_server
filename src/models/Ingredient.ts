import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  abbreviation: { type: String, required: true },
  glycemicIndex: { type: Number, required: true },
  breadUnitsIn1g: { type: Number, required: true },
  caloriesPer100g: { type: Number, default: 0 },
  unit: { type: String, default: "g" },
  gramsPerPiece: { type: Number, default: null },
  caloriesPerPiece: { type: Number, default: null },
  densityGPerMl: { type: Number, default: null },
});

export const Ingredient = mongoose.model("Ingredient", ingredientSchema);
