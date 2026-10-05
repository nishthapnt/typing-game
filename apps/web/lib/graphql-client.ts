import { GraphQLClient } from "graphql-request";
import { useAuthStore } from "./store";

// Fallback keeps builds (e.g. Vercel) working when the env var isn't configured.
const endpoint =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://typing-game-7109.onrender.com/graphql";

export const client = new GraphQLClient(endpoint);

export const getAuthClient = () => {
  const token = useAuthStore.getState().token;

  if (token) {
    return new GraphQLClient(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return client;
};

const isNetworkError = (err: unknown) => {
  const e = err as { response?: { errors?: unknown; status?: number } };
  // GraphQL errors (e.g. "Invalid credentials") come with a response; don't retry those.
  if (e?.response?.errors) return false;
  return true;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Fire-and-forget ping to wake a cold-starting host (e.g. Render free tier). */
export const wakeServer = () => {
  client.request("{ __typename }").catch(() => {});
};

/**
 * Runs a request, retrying on network/cold-start failures for up to ~90s.
 * Calls onWaking once the first attempt fails so the UI can show a notice.
 */
export async function requestWithRetry<T>(
  fn: () => Promise<T>,
  onWaking?: () => void,
  maxAttempts = 8
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!isNetworkError(err) || attempt >= maxAttempts) throw err;
      if (attempt === 1) onWaking?.();
      await sleep(Math.min(3000 * attempt, 12000));
    }
  }
}
