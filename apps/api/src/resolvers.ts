import { AuthService } from "./services/auth.service";
import { GameService } from "./services/game.service";
import {type GraphQLContext } from "./context";
import { GraphQLError } from "graphql";

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.userId) return null;
      try {
        return await AuthService.getMe(context.userId);
      } catch (e) {
        return null;
      }
    },
    myGameHistory: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.userId) throw new GraphQLError("Unauthorized");
      return GameService.getMyGameHistory(context.userId);
    },
    myBestScore: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.userId) throw new GraphQLError("Unauthorized");
      return GameService.getMyBestScore(context.userId);
    },
    leaderboard: async () => {
      return GameService.getLeaderboard();
    },
  },
  Mutation: {
    register: async (_: any, args: any) => {
      try {
        return await AuthService.register(args.name, args.email, args.passwordHashRaw);
      } catch (e: any) {
        throw new GraphQLError(e.message || "Registration failed");
      }
    },
    login: async (_: any, args: any) => {
      try {
        return await AuthService.login(args.email, args.passwordHashRaw);
      } catch (e: any) {
        throw new GraphQLError(e.message || "Login failed");
      }
    },
    saveGameResult: async (_: any, args: any, context: GraphQLContext) => {
      if (!context.userId) throw new GraphQLError("Unauthorized");
      if (args.correctCharacters !== 20) throw new GraphQLError("Invalid game result");
      if (args.wrongAttempts < 0 || args.penaltyTime < 0 || args.completionTime <= 0) {
        throw new GraphQLError("Invalid game result values");
      }
      return GameService.saveGameResult(
        context.userId,
        args.completionTime,
        args.correctCharacters,
        args.wrongAttempts,
        args.penaltyTime
      );
    },
  },
};
