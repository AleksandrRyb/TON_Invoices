# TON Verifiable Invoices - Backend Service

This document contains a step-by-step plan and checklist for creating the backend part of the application.

## 1. Architecture and Operating Principle

The system consists of three key components:

1.  **Client (Frontend)**: Interacts with the user and their non-custodial wallet (e.g., Tonkeeper) via the TON Connect protocol.
2.  **Backend (This Service)**: An Express.js server. It does not have access to user keys and does not initiate transactions. Its main tasks are to **issue tasks** to the client and **verify** their execution by directly querying the blockchain.
3.  **TON Blockchain**: The single source of truth. All backend checks are based on data obtained directly from the blockchain.

### Principle: "Don't Trust, Verify"

- **Authentication**: The backend generates a random message (`payload`), the frontend asks the wallet to sign it (`ton_proof`), and the backend then verifies this signature. This proves that the user owns the wallet.
- **Payment**: The backend tells the frontend **what** and **where** to transfer funds. The frontend asks the wallet to execute this transaction. The backend independently finds this transaction on the blockchain and verifies all its parameters (amount, recipient, comment).

---

## 2. Development Checklist

### ☐ Stage 1: Project and Environment Setup

- [x] Initialize `npm` project (`npm init`).
- [x] Install and configure **TypeScript** (`tsconfig.json`).
- [x] Install core dependencies: `express`, `cors`, `dotenv`, `pino`.
- [x] Install dev dependencies: `@types/node`, `@types/express`, `ts-node-dev`, `pino-pretty`.
- [x] Create a base folder structure: `/src`, `/src/api`, `/src/services`, `/src/config`.
- [x] Set up a basic Express server in `src/server.ts` and `src/app.ts`.
- [x] Add a script for running in development mode to `package.json` (e.g., `"dev": "ts-node-dev ... | pino-pretty"`).

### ☐ Stage 2: Database Setup with Prisma

- [x] Run **PostgreSQL** locally (recommended via Docker).
- [x] Install Prisma: `prisma`, `@prisma/client`.
- [x] Initialize Prisma (`npx prisma init`).
- [x] Configure the PostgreSQL connection in the `.env` file.
- [x] Create the data schema in `prisma/schema.prisma`. Required models:
  - `User` (to store wallet address and user information).
  - `Invoice` (for payment details: amount, status, linked to `User`).
- [x] Apply migrations and generate Prisma Client (`npx prisma migrate dev`).

### ☑ Stage 3: Implementation of the Authentication Flow (`ton_proof`)

- [x] Install cryptographic dependencies: `@ton/core`, `js-sha256`, `@tonconnect/sdk`.
- [x] Implement `AuthService` for stateless authentication according to the `ton_proof` standard.
  - [x] Generate a `challenge` without storing state on the backend.
  - [x] Verify the `ton_proof` signature, including a complex check of the message structure to fix the "Invalid signature" error.
- [x] Create routes `POST /api/auth/challenge` and `POST /api/auth/verify`.
- [x] The verification route finds or creates a user in the DB, saving the address in a user-friendly format.
- **[x] Update integration tests for the authentication flow:**
  - [x] Test environment configured to run Docker and apply migrations.
  - [x] Controller tests (`auth.test.ts`) rewritten using mocks for the service layer (`authService`, `userService`).
  - [x] Tests written to cover:
    - [x] Successfully obtaining a `challenge`.
    - [x] Successful verification for new and existing users.
    - [x] Error on an invalid signature.
    - [x] Error when required fields are missing in the request.

### ☑ Stage 4: Implementation of the Main Payment Flow

- [x] Create route `POST /api/invoices`:
  - [x] Checks if the user is authenticated (by checking for `address` in the DB).
  - [x] Creates a new invoice record in the DB with `pending` status.
  - [x] Returns `invoiceId`, amount, and the **static recipient wallet address**.
- [x] Create route `GET /api/invoices/:id` to get the current status of an invoice.

### ☐ Stage 5: WebSocket Integration for Real-Time Updates

- [ ] Install the `ws` library.
- [ ] Configure `WebSocket.Server` on the same port as the Express server.
- [ ] Implement subscription logic: when a client connects via WebSocket, it sends the `invoiceId` it wants to subscribe to.
- [ ] Create a service that allows sending messages to specific clients by `invoiceId`.

### ☐ Stage 6: Blockchain Transaction Verification

- [ ] Create a `TonApiService` to interact with a public TON API (e.g., Toncenter). Install `axios` for HTTP requests.
- [ ] Implement a background process (can start with `setInterval`) that:
  - [ ] Retrieves all invoices with `pending` status from the DB.
  - [ ] For each invoice, makes a request to the TON API to get the latest transactions for the **recipient's wallet**.
  - [ ] Searches among the transactions for one that matches the **amount** and **comment/payload** (e.g., `invoice_123`).
- [ ] When the transaction is found and verified:
  - [ ] Update the invoice status in PostgreSQL to `completed`.
  - [ ] Send a notification to the client via WebSocket.
  - [ ] Stop polling for this invoice.

### ☐ Stage 7: Security and Deployment Preparation

- [ ] Ensure all secret data (keys, DB passwords) are used only through environment variables (`.env`).
- [ ] Add validation for all incoming data (e.g., using `zod` or `joi`).
- [ ] Configure CORS to allow requests only from your frontend domain.
- [ ] (Optional) Create a `Dockerfile` for containerizing the backend application.
