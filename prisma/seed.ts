import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const baseIngredients = [
  { name: "Картофель", abbreviation: "карт.", glycemicIndex: 85, breadUnitsIn1g: 0.17, caloriesPer100g: 77, unit: "g" },
  { name: "Куриная грудка", abbreviation: "кур.", glycemicIndex: 0, breadUnitsIn1g: 0, caloriesPer100g: 165, unit: "g" },
  { name: "Рис", abbreviation: "рис", glycemicIndex: 73, breadUnitsIn1g: 0.78, caloriesPer100g: 130, unit: "g" },
  { name: "Томат", abbreviation: "томат", glycemicIndex: 15, breadUnitsIn1g: 0.03, caloriesPer100g: 18, unit: "g" },
  { name: "Огурец", abbreviation: "огур.", glycemicIndex: 15, breadUnitsIn1g: 0.02, caloriesPer100g: 15, unit: "g" },
  { name: "Яйцо", abbreviation: "яйцо", glycemicIndex: 0, breadUnitsIn1g: 0, caloriesPer100g: 157, unit: "шт", gramsPerPiece: 55, caloriesPerPiece: 78 },
  { name: "Молоко", abbreviation: "мол.", glycemicIndex: 31, breadUnitsIn1g: 0.05, caloriesPer100g: 52, unit: "мл", densityGPerMl: 1.03 },
  { name: "Овсяные хлопья", abbreviation: "овс.", glycemicIndex: 55, breadUnitsIn1g: 0.66, caloriesPer100g: 352, unit: "g" },
  { name: "Гречка", abbreviation: "греч.", glycemicIndex: 50, breadUnitsIn1g: 0.65, caloriesPer100g: 110, unit: "g" },
  { name: "Творог", abbreviation: "твор.", glycemicIndex: 30, breadUnitsIn1g: 0.03, caloriesPer100g: 120, unit: "g" },
  { name: "Яблоко", abbreviation: "ябл.", glycemicIndex: 36, breadUnitsIn1g: 0.12, caloriesPer100g: 52, unit: "g" },
  { name: "Банан", abbreviation: "бан.", glycemicIndex: 51, breadUnitsIn1g: 0.23, caloriesPer100g: 89, unit: "g" },
  { name: "Лосось", abbreviation: "лос.", glycemicIndex: 0, breadUnitsIn1g: 0, caloriesPer100g: 208, unit: "g" },
  { name: "Макароны", abbreviation: "мак.", glycemicIndex: 50, breadUnitsIn1g: 0.75, caloriesPer100g: 131, unit: "g" },
  { name: "Говядина", abbreviation: "гов.", glycemicIndex: 0, breadUnitsIn1g: 0, caloriesPer100g: 250, unit: "g" },
  { name: "Лук", abbreviation: "лук", glycemicIndex: 15, breadUnitsIn1g: 0.09, caloriesPer100g: 40, unit: "g" },
  { name: "Морковь", abbreviation: "морк.", glycemicIndex: 35, breadUnitsIn1g: 0.07, caloriesPer100g: 41, unit: "g" },
  { name: "Брокколи", abbreviation: "брок.", glycemicIndex: 15, breadUnitsIn1g: 0.04, caloriesPer100g: 34, unit: "g" },
  { name: "Авокадо", abbreviation: "авок.", glycemicIndex: 10, breadUnitsIn1g: 0.02, caloriesPer100g: 160, unit: "g" },
  { name: "Хлеб цельнозерновой", abbreviation: "хлеб", glycemicIndex: 50, breadUnitsIn1g: 0.50, caloriesPer100g: 240, unit: "g" },
];

const dishImages = {
  omelette: "https://www.svgrepo.com/download/295427/omelette.svg",
  chicken: "https://www.svgrepo.com/download/427360/chicken-turkey-2.svg",
  salad: "https://www.svgrepo.com/download/244495/salad.svg",
  salmon: "https://www.svgrepo.com/download/156641/salmon.svg",
  spaghetti: "https://www.svgrepo.com/download/398366/spaghetti.svg",
  soup: "https://www.svgrepo.com/download/295437/soup.svg",
  potatoes: "https://www.svgrepo.com/download/227312/fried-potatoes-french-fries.svg",
  toast: "https://www.svgrepo.com/download/295500/toast-food-and-restaurant.svg",
  rice: "https://www.svgrepo.com/download/505200/rice.svg",
  juice: "https://www.svgrepo.com/download/53093/juice.svg",
};

const dishImageByName: Record<string, string> = {
  "Овсяная каша с бананом": dishImages.rice,
  "Омлет с томатом": dishImages.omelette,
  "Курица с рисом": dishImages.chicken,
  "Гречка с говядиной": dishImages.rice,
  "Салат с авокадо и огурцом": dishImages.salad,
  "Запеченный лосось с брокколи": dishImages.salmon,
  "Творожный завтрак с яблоком": dishImages.toast,
  "Рисовая миска с курицей и овощами": dishImages.rice,
  "Паста с говядиной": dishImages.spaghetti,
  "Картофельный омлет": dishImages.omelette,
  "Теплый салат с курицей": dishImages.salad,
  "Гречневый боул с авокадо": dishImages.rice,
  "Запеканка из творога": dishImages.omelette,
  "Овсянка с яблоком": dishImages.rice,
  "Суп с курицей и рисом": dishImages.soup,
  "Лосось с рисом и огурцом": dishImages.salmon,
  "Паста с томатами": dishImages.spaghetti,
  "Картофель с говядиной": dishImages.potatoes,
  "Тост с авокадо и яйцом": dishImages.toast,
  "Салат с творогом и огурцом": dishImages.salad,
  "Брокколи с яйцом": dishImages.omelette,
  "Рис с овощами": dishImages.rice,
  "Курица с картофелем и луком": dishImages.chicken,
  "Смузи-боул с бананом и яблоком": dishImages.juice,
};

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { hash, salt };
}

async function main() {
  for (const ingredient of baseIngredients) {
    await prisma.ingredients.upsert({
      where: { name: ingredient.name },
      update: {
        abbreviation: ingredient.abbreviation,
        glycemicIndex: ingredient.glycemicIndex,
        breadUnitsIn1g: ingredient.breadUnitsIn1g,
        caloriesPer100g: ingredient.caloriesPer100g,
        unit: ingredient.unit,
        gramsPerPiece: ingredient.gramsPerPiece ?? null,
        caloriesPerPiece: ingredient.caloriesPerPiece ?? null,
        densityGPerMl: ingredient.densityGPerMl ?? null,
      },
      create: ingredient,
    });
  }

  const seedUsers = [
    { username: "admin", email: "admin@gmail.com", role: "ADMIN" as const, password: "admin12345" },
    { username: "alex", email: "alex@gmail.com", role: "USER" as const, password: "user12345" },
    { username: "maria", email: "maria@gmail.com", role: "USER" as const, password: "user12345" },
    { username: "nikita", email: "nikita@gmail.com", role: "USER" as const, password: "user12345" },
    { username: "olga", email: "olga@gmail.com", role: "USER" as const, password: "user12345" },
    { username: "pavel", email: "pavel@gmail.com", role: "USER" as const, password: "user12345" },
  ];

  const usersByEmail = new Map<string, number>();

  for (const user of seedUsers) {
    const { hash, salt } = hashPassword(user.password);
    const upserted = await prisma.users.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        role: user.role,
      },
      create: {
        username: user.username,
        email: user.email,
        password: hash,
        salt,
        role: user.role,
      },
      select: { id: true, email: true },
    });
    usersByEmail.set(upserted.email, upserted.id);
  }

  const ingredients = await prisma.ingredients.findMany({
    select: { id: true, name: true },
  });
  const ingredientIds = new Map(ingredients.map((i) => [i.name, i.id]));
  const ing = (name: string) => {
    const id = ingredientIds.get(name);
    if (!id) throw new Error(`Ingredient not found: ${name}`);
    return id;
  };

  const statusCycle: Array<"ACCEPTED" | "PENDING" | "REJECTED"> = [
    "ACCEPTED", "PENDING", "REJECTED", "ACCEPTED", "PENDING", "REJECTED",
    "ACCEPTED", "ACCEPTED", "PENDING", "REJECTED", "ACCEPTED", "PENDING",
    "REJECTED", "ACCEPTED", "PENDING", "PENDING", "REJECTED", "ACCEPTED",
    "PENDING", "REJECTED", "ACCEPTED", "PENDING", "ACCEPTED", "REJECTED",
  ];

  const dishes = [
    { name: "Овсяная каша с бананом", description: "Сытный завтрак с мягкой текстурой.", recipe: "Сварить овсянку на молоке, добавить банан и перемешать.", cookingTime: 12, author: "alex@gmail.com", ingredients: [{ name: "Овсяные хлопья", quantity: 60, unit: "g" }, { name: "Молоко", quantity: 250, unit: "мл" }, { name: "Банан", quantity: 120, unit: "g" }] },
    { name: "Омлет с томатом", description: "Классический омлет с овощами.", recipe: "Взбить яйца, добавить томат и обжарить.", cookingTime: 10, author: "maria@gmail.com", ingredients: [{ name: "Яйцо", quantity: 3, unit: "шт" }, { name: "Томат", quantity: 120, unit: "g" }, { name: "Молоко", quantity: 40, unit: "мл" }] },
    { name: "Курица с рисом", description: "Простой обед с высоким содержанием белка.", recipe: "Отварить рис, обжарить курицу и подать вместе.", cookingTime: 30, author: "nikita@gmail.com", ingredients: [{ name: "Куриная грудка", quantity: 200, unit: "g" }, { name: "Рис", quantity: 100, unit: "g" }, { name: "Лук", quantity: 50, unit: "g" }] },
    { name: "Гречка с говядиной", description: "Теплое блюдо на каждый день.", recipe: "Отварить гречку, протушить говядину с луком.", cookingTime: 40, author: "olga@gmail.com", ingredients: [{ name: "Гречка", quantity: 90, unit: "g" }, { name: "Говядина", quantity: 180, unit: "g" }, { name: "Лук", quantity: 60, unit: "g" }] },
    { name: "Салат с авокадо и огурцом", description: "Свежий легкий салат.", recipe: "Нарезать ингредиенты, перемешать и подать.", cookingTime: 8, author: "pavel@gmail.com", ingredients: [{ name: "Авокадо", quantity: 80, unit: "g" }, { name: "Огурец", quantity: 120, unit: "g" }, { name: "Томат", quantity: 100, unit: "g" }] },
    { name: "Запеченный лосось с брокколи", description: "Полезный ужин.", recipe: "Запечь лосось и брокколи в духовке.", cookingTime: 25, author: "alex@gmail.com", ingredients: [{ name: "Лосось", quantity: 180, unit: "g" }, { name: "Брокколи", quantity: 160, unit: "g" }] },
    { name: "Творожный завтрак с яблоком", description: "Быстрый белковый перекус.", recipe: "Смешать творог с кусочками яблока.", cookingTime: 5, author: "maria@gmail.com", ingredients: [{ name: "Творог", quantity: 180, unit: "g" }, { name: "Яблоко", quantity: 120, unit: "g" }] },
    { name: "Рисовая миска с курицей и овощами", description: "Сбалансированное блюдо в одной тарелке.", recipe: "Смешать рис, курицу и слегка обжаренные овощи.", cookingTime: 28, author: "nikita@gmail.com", ingredients: [{ name: "Рис", quantity: 90, unit: "g" }, { name: "Куриная грудка", quantity: 170, unit: "g" }, { name: "Морковь", quantity: 70, unit: "g" }, { name: "Брокколи", quantity: 70, unit: "g" }] },
    { name: "Паста с говядиной", description: "Сытная паста для ужина.", recipe: "Отварить макароны, обжарить говядину с луком.", cookingTime: 35, author: "olga@gmail.com", ingredients: [{ name: "Макароны", quantity: 100, unit: "g" }, { name: "Говядина", quantity: 160, unit: "g" }, { name: "Лук", quantity: 50, unit: "g" }] },
    { name: "Картофельный омлет", description: "Плотный завтрак в испанском стиле.", recipe: "Поджарить картофель, залить яйцом и довести до готовности.", cookingTime: 20, author: "pavel@gmail.com", ingredients: [{ name: "Картофель", quantity: 180, unit: "g" }, { name: "Яйцо", quantity: 3, unit: "шт" }, { name: "Лук", quantity: 40, unit: "g" }] },
    { name: "Теплый салат с курицей", description: "Салат с теплой куриной грудкой.", recipe: "Обжарить курицу, смешать с овощами.", cookingTime: 18, author: "alex@gmail.com", ingredients: [{ name: "Куриная грудка", quantity: 160, unit: "g" }, { name: "Огурец", quantity: 100, unit: "g" }, { name: "Томат", quantity: 100, unit: "g" }] },
    { name: "Гречневый боул с авокадо", description: "Легкий и питательный боул.", recipe: "Сварить гречку, добавить авокадо и овощи.", cookingTime: 22, author: "maria@gmail.com", ingredients: [{ name: "Гречка", quantity: 85, unit: "g" }, { name: "Авокадо", quantity: 90, unit: "g" }, { name: "Огурец", quantity: 100, unit: "g" }] },
    { name: "Запеканка из творога", description: "Нежная творожная запеканка.", recipe: "Смешать творог с яйцом и запечь.", cookingTime: 35, author: "nikita@gmail.com", ingredients: [{ name: "Творог", quantity: 250, unit: "g" }, { name: "Яйцо", quantity: 2, unit: "шт" }, { name: "Молоко", quantity: 50, unit: "мл" }] },
    { name: "Овсянка с яблоком", description: "Классическая овсянка с фруктами.", recipe: "Сварить овсянку, добавить яблоко кубиками.", cookingTime: 11, author: "olga@gmail.com", ingredients: [{ name: "Овсяные хлопья", quantity: 60, unit: "g" }, { name: "Молоко", quantity: 200, unit: "мл" }, { name: "Яблоко", quantity: 100, unit: "g" }] },
    { name: "Суп с курицей и рисом", description: "Легкий домашний суп.", recipe: "Сварить бульон, добавить рис и овощи.", cookingTime: 45, author: "pavel@gmail.com", ingredients: [{ name: "Куриная грудка", quantity: 150, unit: "g" }, { name: "Рис", quantity: 70, unit: "g" }, { name: "Морковь", quantity: 60, unit: "g" }, { name: "Лук", quantity: 40, unit: "g" }] },
    { name: "Лосось с рисом и огурцом", description: "Рыбный вариант боула.", recipe: "Запечь лосось, подать с рисом и огурцом.", cookingTime: 30, author: "alex@gmail.com", ingredients: [{ name: "Лосось", quantity: 160, unit: "g" }, { name: "Рис", quantity: 90, unit: "g" }, { name: "Огурец", quantity: 100, unit: "g" }] },
    { name: "Паста с томатами", description: "Быстрая паста без мяса.", recipe: "Сварить макароны, добавить тушеные томаты с луком.", cookingTime: 20, author: "maria@gmail.com", ingredients: [{ name: "Макароны", quantity: 90, unit: "g" }, { name: "Томат", quantity: 150, unit: "g" }, { name: "Лук", quantity: 40, unit: "g" }] },
    { name: "Картофель с говядиной", description: "Домашнее горячее блюдо.", recipe: "Потушить говядину с картофелем.", cookingTime: 55, author: "nikita@gmail.com", ingredients: [{ name: "Картофель", quantity: 220, unit: "g" }, { name: "Говядина", quantity: 170, unit: "g" }, { name: "Морковь", quantity: 50, unit: "g" }] },
    { name: "Тост с авокадо и яйцом", description: "Популярный завтрак.", recipe: "Подсушить хлеб, добавить авокадо и яйцо.", cookingTime: 10, author: "olga@gmail.com", ingredients: [{ name: "Хлеб цельнозерновой", quantity: 80, unit: "g" }, { name: "Авокадо", quantity: 80, unit: "g" }, { name: "Яйцо", quantity: 1, unit: "шт" }] },
    { name: "Салат с творогом и огурцом", description: "Освежающий белковый салат.", recipe: "Смешать творог с огурцом и томатом.", cookingTime: 7, author: "pavel@gmail.com", ingredients: [{ name: "Творог", quantity: 150, unit: "g" }, { name: "Огурец", quantity: 100, unit: "g" }, { name: "Томат", quantity: 80, unit: "g" }] },
    { name: "Брокколи с яйцом", description: "Простой гарнир или легкий ужин.", recipe: "Отварить брокколи и добавить вареное яйцо.", cookingTime: 14, author: "alex@gmail.com", ingredients: [{ name: "Брокколи", quantity: 180, unit: "g" }, { name: "Яйцо", quantity: 2, unit: "шт" }] },
    { name: "Рис с овощами", description: "Легкий овощной вариант.", recipe: "Потушить овощи и смешать с рисом.", cookingTime: 24, author: "maria@gmail.com", ingredients: [{ name: "Рис", quantity: 90, unit: "g" }, { name: "Морковь", quantity: 70, unit: "g" }, { name: "Лук", quantity: 50, unit: "g" }, { name: "Брокколи", quantity: 80, unit: "g" }] },
    { name: "Курица с картофелем и луком", description: "Классика домашнего меню.", recipe: "Запечь курицу с картофелем и луком.", cookingTime: 50, author: "nikita@gmail.com", ingredients: [{ name: "Куриная грудка", quantity: 200, unit: "g" }, { name: "Картофель", quantity: 220, unit: "g" }, { name: "Лук", quantity: 60, unit: "g" }] },
    { name: "Смузи-боул с бананом и яблоком", description: "Фруктовый быстрый завтрак.", recipe: "Взбить молоко, банан и яблоко в блендере.", cookingTime: 6, author: "olga@gmail.com", ingredients: [{ name: "Молоко", quantity: 220, unit: "мл" }, { name: "Банан", quantity: 110, unit: "g" }, { name: "Яблоко", quantity: 90, unit: "g" }] },
  ];

  for (let i = 0; i < dishes.length; i++) {
    const dish = dishes[i];
    const dishStatus = statusCycle[i] ?? "PENDING";
    const dishImage = dishImageByName[dish.name] ?? dishImages.salad;
    const authorId = usersByEmail.get(dish.author);
    if (!authorId) throw new Error(`Author not found: ${dish.author}`);

    const savedDish = await prisma.dishes.upsert({
      where: { name: dish.name },
      update: {
        description: dish.description,
        recipe: dish.recipe,
        cookingTime: dish.cookingTime,
        status: dishStatus,
        authorId,
        image: dishImage,
        updatedAt: new Date(),
      },
      create: {
        name: dish.name,
        description: dish.description,
        recipe: dish.recipe,
        cookingTime: dish.cookingTime,
        status: dishStatus,
        authorId,
        image: dishImage,
      },
      select: { id: true },
    });

    await prisma.dishIngredients.deleteMany({ where: { dishId: savedDish.id } });
    await prisma.dishIngredients.createMany({
      data: dish.ingredients.map((item) => ({
        dishId: savedDish.id,
        ingredientId: ing(item.name),
        quantity: item.quantity,
        unit: item.unit,
      })),
    });
  }

  console.log(`Seed complete: ${seedUsers.length} users, ${baseIngredients.length} ingredients, ${dishes.length} dishes`);
  console.log("Admin login: admin@gmail.com / admin12345");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
