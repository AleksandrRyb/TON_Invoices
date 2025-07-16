# TON Verifiable Invoices - Frontend Application

This document contains a step-by-step plan and checklist for creating the client-side of the application using Next.js.

## 1. Technology Stack

* **Framework**: Next.js (App Router)
* **Language**: TypeScript
* **UI Library**: Mantine (This was planned but not implemented. The project uses Tailwind CSS for styling.)
* **Blockchain Interaction**: TON Connect (`@tonconnect/ui-react`)
* **State Management**: React Context (`AuthContext`)
* **HTTP Requests to Backend**: `axios`

## 2. Architecture and Operating Principle

The frontend is a "thin" client. Its main responsibility is to render the user interface and react to user actions and messages from the backend. It **does not contain critical business logic**. All verification and decision-making logic resides on the backend.

**Key Principles:**

1. **Orchestration**: The frontend acts as a conductor between three parties: the user, their wallet, and our backend.
2. **State Display**: The frontend receives data from the backend (invoice status, amount) and displays it. It does not perform calculations itself but only shows what the backend tells it.
3. **Action Initiation**: The user clicks buttons on the frontend, which then requests signatures or transactions from the wallet and invoice creation or data checks from the backend.

---

## 3. Development Checklist

### ☑ Stage 1: Next.js Project Setup

* [x] Initialize project: `npx create-next-app@latest --typescript --tailwind --eslint`.
* [x] Install dependencies:
  * TON: `@tonconnect/ui-react`
  * HTTP: `axios`
* [x] Create a basic page structure (e.g., home, payment page).

### ☑ Stage 2: TON Connect and Authentication Integration

* [x] Wrap the application in `TonConnectUIProvider` in the `providers.tsx` file.
* [x] Set the `manifestUrl` in the provider. The URL is now generated dynamically based on the `NEXT_PUBLIC_FRONTEND_URL` environment variable.
* [x] Add a `<TonConnectButton />` to the site header for easy wallet connection.
* [x] Implement the authentication logic (in `AuthContext.tsx`):
  * [x] After connecting the wallet, if the user is not authenticated, the `ton_proof` process is initiated.
  * [x] Request a `challenge` from the backend: `POST /api/auth/challenge`.
  * [x] Use the `payload` from the challenge to request a `ton_proof` from the wallet via `tonConnectUI.connector.connect()`.
  * [x] Send the `proof` object received from the wallet to the backend for verification: `POST /api/auth/verify`.
  * [x] On success, the backend sets an `httpOnly` cookie to maintain the session.

### ☐ Stage 3: Invoice Creation and Payment

* [x] Create the `[invoiceId]` page to display a specific invoice.
* [x] Implement a function that sends a request to the backend (`POST /api/invoices`) and redirects the user to the invoice page after creation.
* [x] On the invoice page, display its status (`pending`, `completed`) and amount.
* [x] Add a "Pay with Wallet" button. On click:
  * [x] Formulate the transaction object using data from the backend (recipient address, amount).
  * [x] **Important**: In the transaction's `payload`/`memo` field, add the unique invoice identifier (e.g., `invoice_${invoiceId}`).
  * [x] Call `tonConnectUI.sendTransaction({ messages: [...], validUntil: ... })`.
  * [x] Show the user a notification that the transaction has been sent for confirmation.

### ☐ Stage 4: Real-time Updates via WebSockets

* [ ] On the invoice page (`[invoiceId]`), establish a WebSocket connection to the backend.
* [ ] Immediately after connecting, send a message with the `invoiceId` so the backend knows which updates to subscribe this client to.
* [ ] Implement an `onmessage` handler for the socket:
  * [ ] When a message is received (e.g., `{ "status": "completed" }`), update the page state.
  * [ ] Show the user a success message and hide the "Pay" button.
* [ ] Correctly close the WebSocket connection when leaving the page (in a `useEffect` cleanup function).

### ☐ Stage 5: User Experience and Error Handling

* [ ] Show loaders during requests to the backend or while waiting for a response from the wallet.
* [ ] Handle errors:
  * User rejects the transaction in the wallet.
  * Network error during a request to the backend.
  * Invoice has expired.
* [ ] Display clear notifications (`Toast`/`Notification`) about the success or failure of operations.
