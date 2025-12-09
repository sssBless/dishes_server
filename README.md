# Серверная часть приложения (Backend)

API сервер на Fastify с использованием Prisma ORM и PostgreSQL.

## Требования

- Node.js 18+ 
- PostgreSQL 12+
- npm или yarn

## Установка

1. Перейдите в директорию проекта:
```bash
cd 100euro_prisma
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` в корне проекта:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=10000
```

**Важно:**
- Замените `username`, `password`, `localhost`, `5432` и `database_name` на ваши реальные данные PostgreSQL
- `JWT_SECRET` должен быть длинной случайной строкой (минимум 32 символа)
- `PORT` - порт, на котором будет запущен сервер (по умолчанию 10000)

## Настройка базы данных

1. Убедитесь, что PostgreSQL запущен и доступен

2. Выполните миграции базы данных:
```bash
npx prisma migrate deploy
```

Или, если нужно применить все миграции с нуля:
```bash
npx prisma migrate dev
```

3. (Опционально) Сгенерируйте Prisma Client:
```bash
npx prisma generate
```

## Запуск

### Режим разработки

Для разработки с автоматической перезагрузкой при изменениях:

```bash
npm run build
npx nodemon
```

Или используйте отдельные команды:

```bash
# Сборка TypeScript
npm run build

# Запуск сервера
npm run dev
```

### Продакшн режим

1. Соберите проект:
```bash
npm run build
```

2. Запустите сервер:
```bash
node build/app.js
```

Или через переменные окружения:
```bash
PORT=10000 node build/app.js
```

## Структура проекта

```
100euro_prisma/
├── prisma/
│   ├── schema.prisma          # Схема базы данных
│   └── migrations/            # Миграции БД
├── src/
│   ├── modules/
│   │   ├── user/              # Модуль пользователей
│   │   ├── dishes/            # Модуль блюд
│   │   └── ingredients/       # Модуль ингредиентов
│   ├── utils/                 # Утилиты
│   ├── app.ts                 # Точка входа приложения
│   └── server.ts              # Конфигурация сервера
├── resources/
│   └── dishes/                # Загруженные изображения блюд
├── build/                     # Скомпилированный JavaScript (генерируется)
└── package.json
```

## API Endpoints

После запуска сервер будет доступен по адресу `http://localhost:10000` (или указанному в PORT)

### Основные маршруты:

- `GET /healthcheck` - Проверка работоспособности сервера
- `/api/users` - API для работы с пользователями (регистрация, авторизация, профиль)
- `/api/dishes` - API для работы с блюдами (CRUD операции, избранное)
- `/api/ingredients` - API для работы с ингредиентами

### Статические файлы:

- `/images/dishes/*` - Изображения блюд

## Переменные окружения

| Переменная | Описание | Обязательная | По умолчанию |
|------------|----------|--------------|--------------|
| `DATABASE_URL` | Строка подключения к PostgreSQL | Да | - |
| `JWT_SECRET` | Секретный ключ для JWT токенов | Да | - |
| `PORT` | Порт для запуска сервера | Нет | 10000 |

## Работа с базой данных

### Просмотр базы данных в Prisma Studio:
```bash
npx prisma studio
```

Откроется веб-интерфейс по адресу `http://localhost:5555`

### Создание новой миграции:
```bash
npx prisma migrate dev --name название_миграции
```

### Сброс базы данных (осторожно!):
```bash
npx prisma migrate reset
```

## Troubleshooting

### Проблема: Порт уже занят
Если порт 10000 уже занят, измените значение `PORT` в `.env` файле или укажите другой порт при запуске.

### Проблема: Ошибка подключения к БД
- Убедитесь, что PostgreSQL запущен
- Проверьте правильность `DATABASE_URL` в `.env`
- Убедитесь, что база данных существует

### Проблема: Prisma Client не найден
Выполните:
```bash
npx prisma generate
```

### Проблема: Миграции не применяются
Убедитесь, что база данных доступна и `DATABASE_URL` указан правильно, затем:
```bash
npx prisma migrate deploy
```

## Дополнительная информация

- Документация Fastify: https://www.fastify.io/
- Документация Prisma: https://www.prisma.io/docs
- Документация PostgreSQL: https://www.postgresql.org/docs/

