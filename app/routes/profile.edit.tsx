import { data, redirect, Form, Link, useNavigation } from "react-router";

import type { Route } from "./+types/profile.edit";
import { requireUser } from "../lib/auth.server";
import { updateUserMutation } from "../lib/graphql/users.server";
import { GqlRequestError } from "../lib/graphql-client.server";

export async function loader({ request }: Route.LoaderArgs) {
  const { user } = await requireUser(request);
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const { token, user } = await requireUser(request);
  const formData = await request.formData();

  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const ageRaw = String(formData.get("age") ?? "");
  const age = ageRaw ? Number(ageRaw) : undefined;
  const password = String(formData.get("password") ?? "");

  try {
    await updateUserMutation(token, {
      id: user.id,
      name,
      email,
      age,
      ...(password ? { password } : {}),
    });
    return redirect("/profile");
  } catch (error) {
    const message = error instanceof GqlRequestError ? error.message : "Could not update your profile.";
    return data({ error: message }, { status: 400 });
  }
}

export default function EditProfile({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const { user } = loaderData;
  const pending = navigation.state === "submitting";

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Edit Profile</h1>
        <p className="text-slate-500 mt-1">Update your account information.</p>
      </div>

      <Form method="post" className="space-y-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {actionData?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {actionData.error}
          </p>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={user.name}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={user.email}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            min={0}
            defaultValue={user.age ?? ""}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
            New Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link
            to="/profile"
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
          >
            {pending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </Form>
    </div>
  );
}