import "../src/loadEnv.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
import {
  dishImageByName,
  dishNameToPublicId,
  type DishIconKey,
} from "../mongo/dish-image-mapping.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.resolve(__dirname, "../seed-icons");
const manifestPath = path.join(iconsDir, "manifest.json");

const iconFiles: DishIconKey[] = [
  "omelette",
  "chicken",
  "salad",
  "salmon",
  "spaghetti",
  "soup",
  "potatoes",
  "toast",
  "rice",
  "juice",
];

function ensureConfig() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Задайте CLOUDINARY_* в .env");
  }
  cloudinary.config({ cloud_name, api_key, api_secret });
}

async function main() {
  ensureConfig();
  const folder = process.env.CLOUDINARY_FOLDER || "dishes";
  const manifest: Record<string, string> = {};

  for (const iconKey of iconFiles) {
    const file = path.join(iconsDir, `${iconKey}.svg`);
    if (!fs.existsSync(file)) {
      console.error(`Нет файла: ${iconKey}.svg (см. seed-icons/README.md)`);
      process.exit(1);
    }
  }

  const dishNames = Object.keys(dishImageByName);
  console.log(
    `Загрузка ${dishNames.length} картинок (по одной на блюдо) в Cloudinary...\n`
  );

  for (const dishName of dishNames) {
    const iconKey = dishImageByName[dishName];
    const filePath = path.join(iconsDir, `${iconKey}.svg`);
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      public_id: dishNameToPublicId(dishName, iconKey),
      overwrite: true,
      resource_type: "image",
    });

    if (!result.secure_url) {
      throw new Error(`Не удалось загрузить: ${dishName}`);
    }

    manifest[dishName] = result.secure_url;
    console.log(`  ✓ ${dishName} ← ${iconKey}.svg`);
    console.log(`    ${result.secure_url}`);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\nМанифест: ${manifestPath}`);
  console.log("Дальше: npm run db:seed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
