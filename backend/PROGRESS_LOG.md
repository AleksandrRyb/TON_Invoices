# Прогресс разработки backend

## Этап 1: Настройка проекта и окружения

- [x] Инициализирован npm-проект (`npm init -y`)
- [x] Установлены основные зависимости: express, cors, dotenv, pino
- [x] Установлены dev-зависимости: typescript, @types/node, @types/express, @types/cors, ts-node-dev, pino-pretty
- [x] Создан и настроен tsconfig.json
- [x] Создана структура папок: src, src/api/routes, src/api/controllers, src/services, src/config, src/ws
- [x] Создан базовый Express-приложение (app.ts)
- [x] Создан файл точки входа (server.ts)
- [x] Добавлены скрипты dev, build, start в package.json
- [x] Создан .gitignore
- [x] Создан .env (PORT=8000)
- [x] Сервер успешно запущен командой `npm run dev`
- [x] Создан Dockerfile для backend
- [x] Добавлен сервис backend в docker-compose.yaml
- [x] Исправлен init-скрипт whale.sql: теперь схема public принадлежит пользователю whale, выданы все необходимые права
- [x] Пересоздан volume базы данных и повторно применён init-скрипт

---

## Этап 2: Настройка базы данных с Prisma

- [x] Запущен сервис PostgreSQL через docker-compose
- [x] Установлены зависимости Prisma: prisma, @prisma/client
- [x] Инициализирована Prisma (`npx prisma init`)
- [x] Добавлен DATABASE_URL в .env
- [x] Описана схема данных в prisma/schema.prisma (User, Invoice)
- [x] Применена миграция и сгенерирован Prisma Client (`npx prisma migrate dev --name init`) 

---

## Этап 3: Реализация CRUD API

- [x] Созданы сервисы для User и Invoice (src/services)
- [x] Созданы контроллеры для User и Invoice (src/api/controllers)
- [x] Созданы роуты для User и Invoice (src/api/routes)
- [x] Подключены роуты в app.ts
- [ ] (Опционально) Добавить тесты и документацию 