# Typing Speed Game - Technical Walkthrough

## Architecture
This project uses a monorepo setup to strictly separate frontend and backend while maintaining them in one repository. 
- **Frontend (apps/web):** Next.js App Router for a clean server/client separation. We use `graphql-request` for lightweight, simple API calls (Apollo would be overkill for just 4 queries/mutations). `zustand` is used for global auth state because it's simpler and has less boilerplate than Context API.
- **Backend (apps/api):** Bun + GraphQL Yoga. Bun is incredibly fast, and Yoga provides a standards-compliant GraphQL server with minimal setup. We use Prisma as the ORM to interact with PostgreSQL.

## Database Models
- `User`: Stores `email`, `passwordHash`, and `name`.
- `GameResult`: Stores `completionTime`, `wrongAttempts`, and `penaltyTime`. Tied to `User` via `userId`. We added an index on `completionTime` to make the leaderboard query fast.

## Authentication Flow
1. User registers/logs in with email/password.
2. Backend verifies via `bcryptjs` and signs a JWT (`jsonwebtoken`).
3. Frontend stores the JWT in `localStorage` and updates the Zustand store.
4. On subsequent requests, the JWT is sent in the `Authorization: Bearer <token>` header.
5. The backend `createContext` function verifies the JWT. Resolvers check `context.userId` to authorize actions (meaning a user can never spoof another user's `userId` when saving scores or fetching history).

## Typing Game Logic & Timer Implementation
We use `Date.now()` differences rather than `setInterval` increments.
- When the first valid key is pressed, `startTime` is set to `Date.now()`.
- During the game, a 50ms interval updates the *display time* strictly for UI purposes (using `(Date.now() - startTime) / 1000 + penaltyTime`).
- When the 20th correct key is pressed, `endTime` is set. The final `completionTime` is strictly calculated as `(endTime - startTime) / 1000 + penaltyTime`.
- This approach completely eliminates "setInterval drift" where browser throttling could artificially improve a user's time.

Wrong keys simply increment a `wrongAttempts` counter which adds exactly `0.5s` to the penalty time.

## High Score Logic
- **Local:** We store the best score in `localStorage("typing-game-best-score")`. We only update it if the new `completionTime` is lower (better). We handle hydration safely by checking `typeof window !== "undefined"`.
- **Global:** The backend Leaderboard query fetches `GameResult` and groups them by `userId`, taking the lowest `completionTime` for each user, then sorting the final array to generate ranks.

## Testing
We kept testing lightweight but focused. We use `bun:test` in the API to test the core logic:
- Authentication (success, invalid password, duplicate email).
- Saving game results correctly.
- Leaderboard ordering and grouping correctly.
