import { isRouteErrorResponse, Outlet } from 'react-router';

import type { Route } from './+types/app-layout';
import { authMiddleware, getOptionalUserFromContext } from '../lib/auth.server';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const { user } = getOptionalUserFromContext(context);
  return { user };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={loaderData.user} />
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function ErrorBoundary({ error, loaderData }: Route.ErrorBoundaryProps) {
  let message = 'Something went wrong';
  let details = 'An unexpected error occurred. Please try again.';

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? 'Not found' : `Error ${error.status}`;
    details = (typeof error.data === 'string' && error.data) || error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={loaderData?.user} />
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-xl mx-auto text-center py-16">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{message}</h1>
          <p className="text-slate-500 mt-2">{details}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
