import { data, redirect, Form, Link, useNavigation } from "react-router";

import type { Route } from "./+types/login";
import { getSession, commitSession } from "../lib/sessions.server";
import { loginMutation } from "../lib/graphql/users.server";
import { GqlRequestError } from "../lib/graphql-client.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("token")) {
    throw redirect("/");
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const { access_token } = await loginMutation(email, password);
    const session = await getSession(request.headers.get("Cookie"));
    session.set("token", access_token);

    return redirect("/", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  } catch (error) {
    const message = error instanceof GqlRequestError ? error.message : "Something went wrong. Please try again.";
    return data({ error: message }, { status: 400 });
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const pending = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-100 mb-3">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to continue to PostShare</p>
        </div>

        <Form method="post" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          {actionData?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {actionData.error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </Form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}