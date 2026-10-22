import { useRouteLoaderData } from 'react-router';

import type { loader } from '../routes/app-layout';

// The key is loaded once by the app layout (it's public, but read from the server's env), so any
// page that can start a checkout gets it without threading it through every loader and prop.
export function useStripePublishableKey(): string | undefined {
  return useRouteLoaderData<typeof loader>('routes/app-layout')?.stripePublishableKey;
}
