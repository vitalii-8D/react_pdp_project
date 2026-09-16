const DEFAULT_SOCKET_URL = 'http://localhost:3000';

export function getSocketUrl(): string {
  return process.env.SERVER_URL ?? DEFAULT_SOCKET_URL;
}

// Chat V2 talks to the BE's GraphQL endpoint directly from the browser (mutations over HTTP,
// subscriptions over `graphql-ws`) instead of the Socket.IO gateway - both still resolve against
// the same server, just a different protocol/path.
export function getGraphqlHttpUrl(): string {
  return `${getSocketUrl()}/graphql`;
}

export function getGraphqlWsUrl(): string {
  return `${getSocketUrl().replace(/^http/, 'ws')}/graphql`;
}
