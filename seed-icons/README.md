# Иконки для сида (SVG → Cloudinary)

Скачайте **10 SVG** с SVGRepo и положите в эту папку с **точными именами** файлов.

| Файл | Блюдо | Ссылка для скачивания |
|------|--------|------------------------|
| `omelette.svg` | омлет | https://www.svgrepo.com/download/295427/omelette.svg |
| `chicken.svg` | курица | https://www.svgrepo.com/download/427360/chicken-turkey-2.svg |
| `salad.svg` | салат | https://www.svgrepo.com/download/244495/salad.svg |
| `salmon.svg` | лосось | https://www.svgrepo.com/download/156641/salmon.svg |
| `spaghetti.svg` | паста | https://www.svgrepo.com/download/398366/spaghetti.svg |
| `soup.svg` | суп | https://www.svgrepo.com/download/295437/soup.svg |
| `potatoes.svg` | картофель / фри | https://www.svgrepo.com/download/227312/fried-potatoes-french-fries.svg |
| `toast.svg` | тост | https://www.svgrepo.com/download/295500/toast-food-and-restaurant.svg |
| `rice.svg` | рис / каша | https://www.svgrepo.com/download/505200/rice.svg |
| `juice.svg` | смузи / напиток | https://www.svgrepo.com/download/53093/juice.svg |

## Шаги

1. Откройте каждую ссылку в браузере → «Сохранить как» → имя из таблицы.
2. Все файлы должны лежать в `100euro_prisma/seed-icons/`.
3. Загрузите в Cloudinary (**24 отдельных файла** — по одному на каждое блюдо, даже если SVG одинаковый):

```powershell
cd C:\Users\grekt\Desktop\100euro\100euro_prisma
npm run icons:upload
```

Имена в Cloudinary: `dishes/seed/dish-01-rice`, `dishes/seed/dish-02-omelette`, … — у каждого блюда свой URL, удаление одного блюда не ломает другие.

4. Обновите блюда в БД:

```powershell
npm run db:seed
```

Скрипт создаст `manifest.json`: ключ — **название блюда**, значение — URL Cloudinary.
