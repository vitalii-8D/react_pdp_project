import { GraphQLClient, ClientError, type Variables } from "graphql-request";

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:3000/graphql";

export class GqlRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GqlRequestError";
    this.status = status;
  }
}

function friendlyMessage(message: string): string {
  // BE doesn't wrap the TypeORM unique-constraint error, so it leaks the raw
  // SQLite message; translate the one case the FE actually triggers (email sign-up/change).
  if (message.includes("UNIQUE constraint failed: users.email")) {
    return "An account with this email already exists.";
  }
  return message;
}

function extractMessage(error: ClientError): {
  message: string;
  status: number;
} {
  const first = error.response?.errors?.[0];
  const originalError = (
    first?.extensions as
      | { originalError?: { message?: string | string[]; statusCode?: number } }
      | undefined
  )?.originalError;

  const rawMessage = originalError?.message ?? first?.message ?? error.message;
  const message = friendlyMessage(
    Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage,
  );
  const status = originalError?.statusCode ?? error.response?.status ?? 500;

  return { message, status };
}

export async function gqlRequest<T>(
  query: string,
  variables?: Variables,
  token?: string,
): Promise<T> {
  const client = new GraphQLClient(SERVER_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  try {
    return await client.request<T>(query, variables);
  } catch (error) {
    if (error instanceof ClientError) {
      const { message, status } = extractMessage(error);
      throw new GqlRequestError(message, status);
    }
    throw error;
  }
}
