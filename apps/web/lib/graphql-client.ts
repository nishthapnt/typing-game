import { GraphQLClient } from "graphql-request";
import { useAuthStore } from "./store";

const endpoint = "http://localhost:4000/graphql";

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
