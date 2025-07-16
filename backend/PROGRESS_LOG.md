# Backend Development Progress Log

## Stage 1: Project and Environment Setup

- [x] Initialized npm project (`npm init -y`)
- [x] Installed core dependencies: express, cors, dotenv, pino
- [x] Installed dev dependencies: typescript, @types/node, @types/express, @types/cors, ts-node-dev, pino-pretty
- [x] Created and configured tsconfig.json
- [x] Created folder structure: src, src/api/routes, src/api/controllers, src/services, src/config, src/ws
- [x] Created a basic Express application (app.ts)
- [x] Created the entry point file (server.ts)
- [x] Added dev, build, start scripts to package.json
- [x] Created .gitignore
- [x] Created .env (PORT=8000)
- [x] Server successfully started with `npm run dev`
- [x] Created Dockerfile for the backend
- [x] Added backend service to docker-compose.yaml
- [x] Fixed the whale.sql init script: the public schema now belongs to the 'whale' user, and all necessary privileges have been granted
- [x] Recreated the database volume and reapplied the init script

---

## Stage 2: Database Setup with Prisma

- [x] Started PostgreSQL service via docker-compose
- [x] Installed Prisma dependencies: prisma, @prisma/client
- [x] Initialized Prisma (`npx prisma init`)
- [x] Added DATABASE_URL to .env
- [x] Described the data schema in prisma/schema.prisma (User, Invoice)
- [x] Applied migration and generated Prisma Client (`npx prisma migrate dev --name init`)

---

## Stage 3: CRUD API Implementation

- [x] Created services for User and Invoice (src/services)
- [x] Created controllers for User and Invoice (src/api/controllers)
- [x] Created routes for User and Invoice (src/api/routes)
- [x] Connected routes in app.ts
- [ ] (Optional) Add tests and documentation

---

## Stage 3 (Continued): Authentication and Testing

- [x] Configured TypeScript path aliases for absolute imports.
- [x] Installed `tsconfig-paths` to support aliases in `ts-node-dev`.
- [x] Installed `@ton/crypto` and `ioredis` to implement `ton_proof`.
- [x] Added Redis service to `docker-compose.yml`.
- [x] Implemented `AuthService` with challenge generation and verification via Redis (with TTL and replay-attack protection).
- [x] Implemented `POST /api/auth/challenge` and `POST /api/auth/verify` routes.
- [x] Fixed Prisma issue with `binaryTargets` for correct operation in Docker.
- [x] Configured automatic Prisma migration (`migrate deploy`) on server start in `docker-compose`.
- [x] Set up the test environment: `Jest`, `Supertest`, `ts-jest`.
- [x] Created `docker-compose.test.yml` for isolated tests.
- [x] Implemented `globalSetup` and `globalTeardown` scripts for managing the test environment (starting Docker, migrations, cleanup).
- [x] Wrote comprehensive integration tests for the entire authentication flow.
- [x] Fixed the issue with Jest "hanging" after tests (`--forceExit`).

---

## Stage 4: Main Payment Flow Implementation and Testing

- [x] Installed the `envalid` package for environment variable validation and created `src/config/env.ts`.
- [x] In `invoiceService`, invoice creation now automatically sets the status to `pending` and currency to `TON`, using constants.
- [x] Implemented the `POST /api/invoices` route, which creates an invoice and returns `invoiceId`, `amount`, and a static `recipientWalletAddress`.
- [x] The `GET /api/invoices/:id` route for getting invoice status was checked and works correctly.
- [x] Added integration tests for invoice endpoints (`invoice.test.ts`):
  - [x] Test for successful invoice creation.
  - [x] Tests for errors (non-existent user, missing data).
  - [x] Test for successfully getting invoice status.
  - [x] Test for getting a non-existent invoice (404).
- [x] For test stability, the configuration module was mocked using `jest.mock`.

---

## Stage 3 (Refactoring): Authentication and Test Improvements

- [x] **Reworked `AuthService`**: The `ton_proof` verification logic was completely rewritten for strict compliance with the official documentation, which fixed a critical "Invalid signature" error.
- [x] **Updated Dependencies**: Added `@ton/core`, `js-sha256`, `@tonconnect/sdk` for correct building and verification of cryptographic messages.
- [x] **Address Format**: The user's address is now converted to a user-friendly format before being saved to the database.
- [x] **Rewrote Authentication Tests**: Integration tests for `auth.test.ts` were completely redesigned:
  - [x] Instead of direct interaction with services, mocking (`jest.mock`) is now used to isolate controller logic.
  - [x] Fixed typing and data serialization errors (`Date` in JSON), which stabilized the test suite.
