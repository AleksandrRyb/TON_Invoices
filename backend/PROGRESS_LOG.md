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

---

## Этап 3 (продолжение): Аутентификация и Тестирование

- [x] Настроены TypeScript path-алиасы для абсолютных импортов.
- [x] Установлен `tsconfig-paths` для поддержки алиасов в `ts-node-dev`.
- [x] Установлены `@ton/crypto` и `ioredis` для реализации `ton_proof`.
- [x] Добавлен сервис `Redis` в `docker-compose.yml`.
- [x] Реализован `AuthService` с генерацией и верификацией challenge через Redis (с TTL и защитой от replay-атак).
- [x] Реализованы роуты `POST /api/auth/challenge` и `POST /api/auth/verify`.
- [x] Исправлена проблема Prisma с `binaryTargets` для корректной работы в Docker.
- [x] Настроена автоматическая миграция Prisma (`migrate deploy`) при старте сервера в `docker-compose`.
- [x] Настроено тестовое окружение: `Jest`, `Supertest`, `ts-jest`.
- [x] Создан `docker-compose.test.yml` для изолированных тестов.
- [x] Реализованы скрипты `globalSetup` и `globalTeardown` для управления тестовой средой (запуск Docker, миграции, очистка).
- [x] Написаны полноценные интеграционные тесты для всего потока аутентификации.
- [x] Исправлена проблема с "зависанием" Jest после тестов (`--forceExit`). 

---

## Этап 4: Реализация основного платежного потока и Тестирование

- [x] Установлен пакет `envalid` для валидации переменных окружения и создан `src/config/env.ts`.
- [x] В `invoiceService` создание счета теперь автоматически устанавливает статус `pending` и валюту `TON`, используя константы.
- [x] Реализован роут `POST /api/invoices`, который создает счет и возвращает `invoiceId`, `amount` и статический `recipientWalletAddress`.
- [x] Роут `GET /api/invoices/:id` для получения статуса счета был проверен и работает корректно.
- [x] Добавлены интеграционные тесты для эндпоинтов счетов (`invoice.test.ts`):
  - [x] Тест на успешное создание счета.
  - [x] Тесты на ошибки (несуществующий пользователь, отсутствующие данные).
  - [x] Тест на успешное получение статуса счета.
  - [x] Тест на получение несуществующего счета (404).
- [x] Для стабильности тестов модуль конфигурации был замокан с помощью `jest.mock`. 