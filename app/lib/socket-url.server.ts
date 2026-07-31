const DEFAULT_SOCKET_URL = 'http://localhost:3000';

export function getSocketUrl(): string {
  return process.env.SERVER_URL ?? DEFAULT_SOCKET_URL;
}
