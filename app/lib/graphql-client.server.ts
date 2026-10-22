import { data } from 'react-router';
import { GraphQLClient, ClientError, type RequestOptions, type Variables } from 'graphql-request';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

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

// The backend's human-readable message for a failed request, or `fallback` for anything else
// (network failures, bugs) - those details stay in the server logs, not in the UI.
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  return error instanceof GqlRequestError ? error.message : fallback;
}

export function toActionError(error: unknown, fallback?: string) {
  return data({ error: errorMessage(error, fallback) }, { status: 400 });
}

// Takes a generated `XxxDocument` (see app/graphql/, `npm run codegen`), so the result and variables
// types are inferred from the operation instead of being hand-written at each call site.
export async function gqlRequest<TResult, TVariables extends Variables>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
  token?: string,
): Promise<TResult> {
  const options = {
    document,
    variables,
    requestHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
  } as RequestOptions<Variables, TResult>;

  try {
    return await client.request<TResult>(options);
  } catch (error) {
    if (error instanceof ClientError) {
      const { message, status } = extractMessage(error);
      throw new GqlRequestError(message, status);
    }
    throw error;
  }
}
