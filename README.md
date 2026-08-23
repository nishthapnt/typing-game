# Typing Speed Game

A full-stack typing speed game assignment built with a modern tech stack.

## Tech Stack
* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Zustand, GraphQL Request
* **Backend:** Bun, TypeScript, GraphQL Yoga, Prisma
* **Database:** PostgreSQL (Docker)
* **Authentication:** JWT, bcryptjs

## Features
* Secure registration & login with JWT authentication
* Real-time typing game with 20 random alphabet characters
* 0.5s penalty for wrong keystrokes
* Local storage best score tracking
* Global leaderboard of best times
* Personal game history dashboard
* Responsive, clean UI

## Prerequisites
* Docker & Docker Compose
* Bun (v1+)
* Node.js & npm (for frontend if prefer npm)

## Project Structure
```
typing-speed-game/
├── apps/
│   ├── web/                 # Next.js frontend (npm workspace)
│   └── api/                 # Bun + GraphQL Yoga backend
├── docs/
│   └── WALKTHROUGH.md       # Technical walkthrough
├── docker-compose.yml       # PostgreSQL database
└── package.json             # Root workspace
```

## Setup & Running Locally

1. **Start Database**
   ```bash
   docker compose up -d
   ```

2. **Environment Variables**
   The `.env` file is already provided for the api. If missing, copy `.env.example` to `apps/api/.env`.
   ```bash
   cp .env.example apps/api/.env
   ```

3. **Install Dependencies & Migrate Database**
   ```bash
   # Install backend dependencies and run migrations
   cd apps/api
   bun install
   bunx prisma migrate dev --name init
   
   # Install frontend dependencies
   cd ../../apps/web
   npm install --legacy-peer-deps
   ```

4. **Start Backend**
   ```bash
   cd apps/api
   bun run dev
   ```
   GraphQL API runs at `http://localhost:4000/graphql`

5. **Start Frontend**
   ```bash
   cd apps/web
   npm run dev
   ```
   Frontend runs at `http://localhost:3000`

## Testing
To run the backend tests (auth, leaderboards, game logic):
```bash
cd apps/api
bun test
```
