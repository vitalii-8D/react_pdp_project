import { data } from 'react-router';
import { GraphQLClient, ClientError, type Variables } from 'graphql-request';

export function getServerUrl(): string {
  return process.env.SERVER_URL ?? 'http://localhost:3000';
}

export function getGraphqlHttpUrl(): string {
  return `${getServerUrl()}/graphql`;
}

export function getGraphqlWsUrl(): string {
  return `${getServerUrl().replace(/^http/, 'ws')}/graphql`;
}

const client = new GraphQLClient(getGraphqlHttpUrl());

export class GqlRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GqlRequestError';
    this.status = status;
  }
}

function extractMessage(error: ClientError): {
  message: string;
  status: number;
} {
  const first = error.response?.errors?.[0];
  const originalError = (
    first?.extensions as { originalError?: { message?: string | string[]; statusCode?: number } } | undefined
  )?.originalError;

  const rawMessage = originalError?.message ?? first?.message ?? error.message;
  const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
  const status = originalError?.statusCode ?? error.response?.status ?? 500;

  return { message, status };
}

export function toActionError(error: unknown, fallback = 'Something went wrong. Please try again.') {
  return data({ error: error instanceof GqlRequestError ? error.message : fallback }, { status: 400 });
}

export async function gqlRequest<T>(query: string, variables?: Variables, token?: string): Promise<T> {
  try {
    return await client.request<T>(query, variables, token ? { Authorization: `Bearer ${token}` } : undefined);
  } catch (error) {
    if (error instanceof ClientError) {
      const { message, status } = extractMessage(error);
      throw new GqlRequestError(message, status);
    }
    throw error;
  }
}
