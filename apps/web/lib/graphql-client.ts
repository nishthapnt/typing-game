import { GraphQLClient } from "graphql-request";
import { useAuthStore } from "./store";

const endpoint = process.env.NEXT_PUBLIC_API_URL;

console.log("GRAPHQL ENDPOINT:", endpoint);

if (!endpoint) {
  throw new Error("NEXT_PUBLIC_API_URL is missing");
}

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