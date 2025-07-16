# TON Verifiable Invoices

"TON Verifiable Invoices" is a full-stack application demonstrating a secure and decentralized invoicing system built on the TON (The Open Network) blockchain. Users can authenticate with their TON wallet, create payment invoices, and pay them, with the backend verifying every step directly on the blockchain.

This project follows the "Don't Trust, Verify" principle, where the backend is stateless regarding authentication and independently verifies payment transactions, making it a robust and secure solution for portfolio demonstration.

## Architecture Overview

The system comprises three main components:

1. **Frontend**: A Next.js client that orchestrates interactions between the user, their TON wallet (like Tonkeeper), and the backend. It does not contain any sensitive business logic.
2. **Backend**: An Express.js server that issues tasks (like signing a message for authentication or creating an invoice) and verifies their completion by querying the TON blockchain directly. It is stateless and does not handle user keys.
3. **TON Blockchain**: The single source of truth for all transaction and ownership verification.

## Getting Started

Follow these instructions to set up and run the project locally for development and testing.

### Prerequisites

* Git
* Docker & Docker Compose
* Node.js & npm
* [ngrok](https://ngrok.com/): Required for exposing your local frontend to a public HTTPS URL, which is necessary for TON Connect to communicate with mobile wallets.

### 1. Clone the Repository

```bash
git clone https://github.com/AleksandrRyb/mini-holders.git
cd mini-holders
```

### 2. Configure Environment Variables

You need to set up environment variables for both the backend and frontend services.

**For the Backend:**

1. Navigate to the `backend` directory.
2. Create a file named `.env` by copying the example below.
3. **Crucially, replace `YOUR_WALLET_ADDRESS` with your actual static TON wallet address where you intend to receive payments.**

    ```env
    # backend/.env

    # Server port
    PORT=3001

    # PostgreSQL connection string for Prisma
    DATABASE_URL="postgresql://whale:whale@postgres:5432/whale?schema=public"

    # Secret for signing JWT tokens (replace with a strong secret)
    JWT_SECRET="YOUR_SUPER_SECRET_KEY"

    # Your static wallet address where payments will be received
    RECIPIENT_WALLET_ADDRESS="YOUR_WALLET_ADDRESS"
    ```

**For the Frontend:**

1. Navigate to the `frontend` directory.
2. Create a file named `.env.local`.
3. You will fill in the `NEXT_PUBLIC_FRONTEND_URL` in a later step after starting ngrok.

    ```env
    # frontend/.env.local

    # This URL will be your public ngrok HTTPS address.
    NEXT_PUBLIC_FRONTEND_URL=""
    ```

### 3. Run the Application Stack

1. From the **root directory** of the project, start all services using Docker Compose:

    ```bash
    docker-compose up --build -d
    ```

    This command builds the container images and starts the frontend, backend, and database services in detached mode.
    * Frontend will be available at `http://localhost:3000`.
    * Backend will be available at `http://localhost:3001`.

### 4. Expose Your Frontend with Ngrok

To allow a mobile TON wallet to connect to your local application, you need a public HTTPS URL.

1. In a new terminal window, start ngrok to forward traffic to your frontend service:

    ```bash
    ngrok http 3000
    ```

2. Ngrok will provide you with a public URL (e.g., `https://random-string.ngrok-free.app`). **Copy the HTTPS URL.**
3. Open `frontend/.env.local` and paste the ngrok URL as the value for `NEXT_PUBLIC_FRONTEND_URL`.

    ```env
    # frontend/.env.local
    NEXT_PUBLIC_FRONTEND_URL="https://random-string.ngrok-free.app"
    ```

4. **Restart the frontend container** to apply the environment variable change:

    ```bash
    docker-compose restart frontend
    ```

You can now access the application via your ngrok URL and test the complete wallet authentication and payment workflow.

### 5. Running Backend Tests

The backend includes a full suite of integration tests that run in an isolated environment.

1. Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2. Install npm dependencies:

    ```bash
    npm install
    ```

3. Run the tests:

    ```bash
    npm test
    ```

    This command handles the entire test lifecycle: starting a test database, running migrations, executing tests, and shutting everything down.
