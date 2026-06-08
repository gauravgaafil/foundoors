import { GraphQLClient } from "graphql-request";

const endpoint =
  process.env.WORDPRESS_API_URL || "https://your-site.com/graphql";

let client: GraphQLClient | null = null;

function getClient(): GraphQLClient {
  if (!client) {
    client = new GraphQLClient(endpoint, {
      headers: {
        "Content-Type": "application/json",
      },
      fetch: fetch,
    });
  }
  return client;
}

export async function fetchGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T | null> {
  try {
    const gqlClient = getClient();
    const data = await gqlClient.request<T>(query, variables);
    return data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GraphQL Error]", error);
    }
    return null;
  }
}
