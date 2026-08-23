import { describe, it, expect, beforeAll } from "bun:test";
import { AuthService } from "../src/services/auth.service";
import { GameService } from "../src/services/game.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("API Tests", () => {
  let userId: string;

  beforeAll(async () => {
    // clean up
    await prisma.gameResult.deleteMany();
    await prisma.user.deleteMany();
  });

  it("should register a new user", async () => {
    const { user, token } = await AuthService.register("Test User", "test@example.com", "password123");
    expect(user.email).toBe("test@example.com");
    expect(token).toBeDefined();
    userId = user.id;
  });

  it("should not allow duplicate email", async () => {
    try {
      await AuthService.register("Test User 2", "test@example.com", "password123");
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.message).toBe("User with this email already exists");
    }
  });

  it("should login user", async () => {
    const { user, token } = await AuthService.login("test@example.com", "password123");
    expect(user.id).toBe(userId);
    expect(token).toBeDefined();
  });

  it("should reject invalid password", async () => {
    try {
      await AuthService.login("test@example.com", "wrongpassword");
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.message).toBe("Invalid credentials");
    }
  });

  it("should save game result", async () => {
    const result = await GameService.saveGameResult(userId, 15.5, 20, 2, 1.0);
    expect(result.completionTime).toBe(15.5);
    expect(result.wrongAttempts).toBe(2);
  });

  it("should get best score", async () => {
    await GameService.saveGameResult(userId, 12.0, 20, 0, 0); // new best
    const best = await GameService.getMyBestScore(userId);
    expect(best?.completionTime).toBe(12.0);
  });

  it("should return leaderboard ordered correctly", async () => {
    const { user: user2 } = await AuthService.register("Test User 2", "test2@example.com", "password123");
    await GameService.saveGameResult(user2.id, 10.0, 20, 0, 0);

    const leaderboard = await GameService.getLeaderboard();
    expect(leaderboard.length).toBe(2);
    expect(leaderboard[0]?.bestTime).toBe(10.0);
    expect(leaderboard[0]?.player).toBe("Test User 2");
    expect(leaderboard[1]?.bestTime).toBe(12.0);
    expect(leaderboard[1]?.player).toBe("Test User");
  });
});
