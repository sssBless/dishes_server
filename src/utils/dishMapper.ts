import { Ingredient } from "../models/Ingredient.js";
import { User } from "../models/User.js";

export function buildImageUrl(image?: string | null) {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return null;
}

export function computeNutrition(dish: { ingredients: Array<{ ingredient: any; quantity: number; unit?: string }> }) {
  let totalCalories = 0;
  let totalWeight = 0;
  let weightedGi = 0;
  let totalBreadUnits = 0;

  for (const di of dish.ingredients) {
    const ingredient = di.ingredient;
    if (!ingredient) continue;

    const unit = di.unit || "g";
    const quantity = di.quantity || 0;

    let grams = 0;
    if (unit === "g" || unit === "гр" || unit.toLowerCase() === "g") {
      grams = quantity;
    } else if (unit === "кг") {
      grams = quantity * 1000;
    } else if (unit === "мл") {
      grams = quantity * (ingredient.densityGPerMl ?? 1);
    } else if (unit === "шт") {
      grams = (ingredient.gramsPerPiece ?? 0) * quantity;
    } else if (unit === "ст.л.") {
      grams = quantity * 15;
    } else if (unit === "ч.л.") {
      grams = quantity * 5;
    } else if (unit === "стакан") {
      grams = quantity * 200;
    } else {
      grams = quantity;
    }

    if (grams <= 0) continue;

    totalWeight += grams;
    weightedGi += (ingredient.glycemicIndex || 0) * grams;
    totalBreadUnits += (ingredient.breadUnitsIn1g || 0) * grams;

    if (unit === "шт" && ingredient.caloriesPerPiece != null) {
      totalCalories += ingredient.caloriesPerPiece * quantity;
    } else {
      totalCalories += ((ingredient.caloriesPer100g || 0) * grams) / 100;
    }
  }

  const avgGi = totalWeight > 0 ? weightedGi / totalWeight : 0;
  return {
    calories: Math.round(totalCalories),
    glycemicIndex: Math.round(avgGi),
    totalBreadUnits: Math.round(totalBreadUnits * 100) / 100,
  };
}

async function loadIngredientsMap(ingredientIds: number[]) {
  const uniqueIds = [...new Set(ingredientIds)];
  const ingredients = await Ingredient.find({ id: { $in: uniqueIds } }).lean();
  return new Map(ingredients.map((i) => [i.id, i]));
}

export async function formatDish(dish: any, withNutrition = true) {
  const ingredientIds = (dish.ingredients || []).map((i: any) => i.ingredientId);
  const ingredientsById = await loadIngredientsMap(ingredientIds);
  const author = await User.findOne({ id: dish.authorId }).lean();

  const ingredients = (dish.ingredients || []).map((di: any) => ({
    dishId: dish.id,
    ingredientId: di.ingredientId,
    quantity: di.quantity,
    unit: di.unit,
    ingredient: ingredientsById.get(di.ingredientId) ?? null,
  }));

  const formatted: any = {
    id: dish.id,
    name: dish.name,
    description: dish.description,
    recipe: dish.recipe,
    cookingTime: dish.cookingTime,
    image: dish.image,
    authorId: dish.authorId,
    status: dish.status,
    createdAt: dish.createdAt,
    updatedAt: dish.updatedAt,
    author: author
      ? { id: author.id, username: author.username, email: author.email }
      : null,
    ingredients,
    imageUrl: buildImageUrl(dish.image),
  };

  if (withNutrition) {
    formatted.nutrition = computeNutrition({ ingredients });
  }

  return formatted;
}

export async function formatDishes(dishes: any[]) {
  return Promise.all(dishes.map((dish) => formatDish(dish)));
}
