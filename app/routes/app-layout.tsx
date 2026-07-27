import { Outlet } from "react-router";

import type { Route } from "./+types/app-layout";
import { getOptionalUser } from "../lib/auth.server";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export async function loader({ request }: Route.LoaderArgs) {
  const { user } = await getOptionalUser(request);
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
