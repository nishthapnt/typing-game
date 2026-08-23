import { createSchema, createYoga } from "graphql-yoga";
import { typeDefs } from "./src/schema";
import { resolvers } from "./src/resolvers";
import { createContext } from "./src/context";

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  context: createContext,
});

const port = process.env.PORT || 4000;

const server = Bun.serve({
  fetch: (request) => yoga.fetch(request),
  port,
});

console.log(`Server is running on http://localhost:${port}/graphql`);