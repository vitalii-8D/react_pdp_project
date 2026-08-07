import type { Route } from './+types/profile.geocode';
import { requireUser } from '../../lib/auth.server';

const MIN_QUERY_LENGTH = 3;
const NOMINATIM_MIN_INTERVAL_MS = 1000;

export interface AddressSuggestion {
  label: string;
  city: string;
  lat: number;
  lon: number;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: { city?: string; town?: string; village?: string };
}

// Nominatim's public instance expects at most ~1 request/sec from a single client — this
// process-local throttle is good enough for a single Node SSR process; a multi-instance
// deployment would need a shared throttle instead.
let lastCallAt = 0;

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);

  const q = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < MIN_QUERY_LENGTH) {
    return { suggestions: [] as AddressSuggestion[] };
  }

  const wait = Math.max(0, NOMINATIM_MIN_INTERVAL_MS - (Date.now() - lastCallAt));
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastCallAt = Date.now();

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': process.env.NOMINATIM_USER_AGENT ?? 'PostShare/1.0' },
  });

  if (!response.ok) {
    return { suggestions: [] as AddressSuggestion[] };
  }

  const results = (await response.json()) as NominatimResult[];
  const suggestions: AddressSuggestion[] = results.map((result) => ({
    label: result.display_name,
    city: result.address?.city ?? result.address?.town ?? result.address?.village ?? result.display_name,
    lat: Number(result.lat),
    lon: Number(result.lon),
  }));

  return { suggestions };
}
