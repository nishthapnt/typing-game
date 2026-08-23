import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

export interface GraphQLContext {
  userId: string | null;
}

export function createContext({ request }: { request: Request }): GraphQLContext {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return { userId: decoded.userId };
    } catch (e) {
      return { userId: null };
    }
  }
  return { userId: null };
}
