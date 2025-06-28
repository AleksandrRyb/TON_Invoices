# Project Progress Log

This document tracks the major development milestones and tasks completed.

## Frontend Setup (Completed)

- **Initialized Next.js Project**: Set up a new Next.js application in the `frontend` directory using the App Router, TypeScript, Tailwind CSS, and ESLint.
- **Installed Dependencies**: Added all necessary libraries:
  - `@mantine/core` and `@mantine/hooks` for the user interface.
  - `@tonconnect/ui-react` for TON blockchain integration.
  - `axios` for making HTTP requests to the backend.
- **Configured Mantine UI**: Integrated the `MantineProvider` into the root layout of the application to enable the component library.
- **Created Basic Page Structure**: Replaced the default Next.js homepage with a simple placeholder structure for the main page.

## Docker & Environment (Completed)

- **Backend Port Change**: Modified the backend service to run on port `3001` to avoid conflicts with the frontend development server.
- **Frontend Dockerfile**: Created a `Dockerfile` for the frontend service to ensure a consistent and reproducible containerized environment.
- **Docker Compose Update**: Added the frontend service to the `docker-compose.yaml` file, enabling it to run alongside the backend and other services.
- **Hot-Reloading**: Configured a volume in `docker-compose.yaml` to mount the local `frontend` source code into the container, allowing for hot-reloading on code changes. 