import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class GameService {
  static async saveGameResult(
    userId: string,
    completionTime: number,
    correctCharacters: number,
    wrongAttempts: number,
    penaltyTime: number
  ) {
    return prisma.gameResult.create({
      data: {
        userId,
        completionTime,
        correctCharacters,
        wrongAttempts,
        penaltyTime,
      },
    });
  }

  static async getMyGameHistory(userId: string) {
    return prisma.gameResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getMyBestScore(userId: string) {
    const bestScore = await prisma.gameResult.findFirst({
      where: { userId },
      orderBy: { completionTime: "asc" },
    });
    return bestScore;
  }

  static async getLeaderboard() {
    // We want the distinct best score per user. Prisma doesn't have a direct distinct-on with order by min easily without native query.
    // Instead, we can group by user or just fetch all and process, but for efficiency, let's use raw query or Prisma groupby.
    const results = await prisma.gameResult.findMany({
      include: { user: true },
      orderBy: { completionTime: "asc" },
    });
    
    const leaderboardMap = new Map();
    for (const result of results) {
      if (!leaderboardMap.has(result.userId)) {
        leaderboardMap.set(result.userId, result);
      }
    }
    
    const leaderboard = Array.from(leaderboardMap.values());
    leaderboard.sort((a, b) => a.completionTime - b.completionTime);
    return leaderboard.map((l, index) => ({
      rank: index + 1,
      player: l.user.name,
      bestTime: l.completionTime,
    }));
  }
}
