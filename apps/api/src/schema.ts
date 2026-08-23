export const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type GameResult {
    id: ID!
    userId: ID!
    completionTime: Float!
    correctCharacters: Int!
    wrongAttempts: Int!
    penaltyTime: Float!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type LeaderboardEntry {
    rank: Int!
    player: String!
    bestTime: Float!
  }

  type Query {
    me: User
    myGameHistory: [GameResult!]!
    myBestScore: GameResult
    leaderboard: [LeaderboardEntry!]!
  }

  type Mutation {
    register(name: String!, email: String!, passwordHashRaw: String!): AuthPayload!
    login(email: String!, passwordHashRaw: String!): AuthPayload!
    saveGameResult(
      completionTime: Float!,
      correctCharacters: Int!,
      wrongAttempts: Int!,
      penaltyTime: Float!
    ): GameResult!
  }
`;
