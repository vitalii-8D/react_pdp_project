import { getServerUrl } from './graphql-client.server';

export function getSocketUrl(): string {
  return getServerUrl();
}
