export type DishIconKey =
  | "omelette"
  | "chicken"
  | "salad"
  | "salmon"
  | "spaghetti"
  | "soup"
  | "potatoes"
  | "toast"
  | "rice"
  | "juice";

/** Какое SVG (из seed-icons/) использовать для каждого блюда. */
export const dishImageByName: Record<string, DishIconKey> = {
  "Овсяная каша с бананом": "rice",
  "Омлет с томатом": "omelette",
  "Курица с рисом": "chicken",
  "Гречка с говядиной": "rice",
  "Салат с авокадо и огурцом": "salad",
  "Запеченный лосось с брокколи": "salmon",
  "Творожный завтрак с яблоком": "toast",
  "Рисовая миска с курицей и овощами": "rice",
  "Паста с говядиной": "spaghetti",
  "Картофельный омлет": "omelette",
  "Теплый салат с курицей": "salad",
  "Гречневый боул с авокадо": "rice",
  "Запеканка из творога": "omelette",
  "Овсянка с яблоком": "rice",
  "Суп с курицей и рисом": "soup",
  "Лосось с рисом и огурцом": "salmon",
  "Паста с томатами": "spaghetti",
  "Картофель с говядиной": "potatoes",
  "Тост с авокадо и яйцом": "toast",
  "Салат с творогом и огурцом": "salad",
  "Брокколи с яйцом": "omelette",
  "Рис с овощами": "rice",
  "Курица с картофелем и луком": "chicken",
  "Смузи-боул с бананом и яблоком": "juice",
};

export function dishNameToPublicId(dishName: string, iconKey: DishIconKey) {
  const index = Object.keys(dishImageByName).indexOf(dishName);
  const num = index >= 0 ? String(index + 1).padStart(2, "0") : "00";
  return `seed/dish-${num}-${iconKey}`;
}
