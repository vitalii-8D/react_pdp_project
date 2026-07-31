const DEFAULT_SITE_URL = 'http://localhost:3003';

export function getSiteUrl(): string {
  return process.env.HOST ? `https://${process.env.HOST}` : DEFAULT_SITE_URL;
}
