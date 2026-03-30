# Elite Finance Tracker - Frontend

This is the frontend repository for the Elite Finance Tracker application. It is a React Single Page Application built with Vite, TailwindCSS, and custom UI components (shadcn/radix).

## Tech Stack
- **Framework:** React 19 + Vite
- **Styling:** TailwindCSS 4
- **State & Data Fetching:** React Query v5 + Orval (auto-generated API client)
- **UI Components:** Radix UI Primitives, Framer Motion, Recharts
- **Auth:** Replit Auth
- **Routing:** Wouter
- **Language:** TypeScript

## Setup & Run Locally

### 1. Requirements
- Node.js >= 20
- pnpm

### 2. Environment Variables
Copy `.env.example` to `.env` and configure the following variables:
```bash
cp .env.example .env
```

**`.env` variables:**
- `VITE_API_URL`: The base URL pointing to the `elite-finance-backend`. Default: `http://localhost:3000`
- `PORT`: (Optional) The port for the Vite dev server. Default: `5000`

### 3. Installation
Install all dependencies using pnpm:
```bash
pnpm install
```

### 4. Running the Dev Server
```bash
pnpm dev
# The app will be available at http://localhost:5000 (or the port you configured)
```

### 5. Type Checking and Building
To verify typescript types and build the application for production:
```bash
# Typecheck
pnpm typecheck

# Build for production
pnpm build
```
Production assets will be located in the `dist/public` folder.

## Integration Details
- The API Client hooks (`src/lib/api-client`) are generated based on the OpenAPI 3.0 specs from the backend using Orval. See `orval.config.ts` for generation configuration.
- The `custom-fetch.ts` handles API requests, auto-attaching Bearer Authentication state populated by the Replit Context hooks (`src/lib/auth`).
