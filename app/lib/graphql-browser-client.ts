// A minimal client-side GraphQL fetch helper for Chat V2. `gqlRequest` in graphql-client.server.ts
// is Node/server-only (it's used from loaders/actions), so components that talk to the BE
// directly from the browser - like ChatWindow already does for Socket.IO and file uploads - need
// their own thin wrapper instead.
export class GraphqlBrowserError extends Error {}

interface GraphqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export async function graphqlBrowserRequest<T>(
  url: string,
  token: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await response.json()) as GraphqlResponse<T>;

  if (json.errors?.length) {
    throw new GraphqlBrowserError(json.errors[0].message);
  }

  if (!json.data) {
    throw new GraphqlBrowserError('Empty GraphQL response.');
  }

  return json.data;
}
