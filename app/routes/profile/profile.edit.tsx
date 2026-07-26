import { redirect, Form, Link, useNavigation } from "react-router";

import type { Route } from "./+types/profile.edit";
import { requireUser } from "../../lib/auth.server";
import { updateUserMutation } from "../../lib/graphql/users.server";
import { toActionError } from "../../lib/graphql-client.server";
import { AuthFormField } from "../../enums/auth-form-field.enum";
import { paths } from "../../lib/paths";
import { cardClassName } from "../../components/Card";
import { TextField } from "../../components/TextField";
import { Button, buttonStyles } from "../../components/Button";

export async function loader({ request }: Route.LoaderArgs) {
  const { user } = await requireUser(request);
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const { token, user } = await requireUser(request);
  const formData = await request.formData();

  const name = String(formData.get(AuthFormField.Name) ?? "");
  const email = String(formData.get(AuthFormField.Email) ?? "");
  const ageRaw = String(formData.get(AuthFormField.Age) ?? "");
  const age = ageRaw ? Number(ageRaw) : undefined;
  const password = String(formData.get(AuthFormField.Password) ?? "");

  try {
    await updateUserMutation(token, {
      id: user.id,
      name,
      email,
      age,
      ...(password ? { password } : {}),
    });
    return redirect(paths.profile());
  } catch (error) {
    return toActionError(error, "Could not update your profile.");
  }
}

export default function EditProfile({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const { user } = loaderData;
  const pending = navigation.state === "submitting";

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Edit Profile
        </h1>
        <p className="text-slate-500 mt-1">Update your account information.</p>
      </div>

      <Form method="post" className={`${cardClassName} p-6 sm:p-8 space-y-5`}>
        {actionData?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {actionData.error}
          </p>
        )}

        <TextField
          id="name"
          label="Name"
          name={AuthFormField.Name}
          type="text"
          required
          defaultValue={user.name}
        />

        <TextField
          id="email"
          label="Email"
          name={AuthFormField.Email}
          type="email"
          required
          defaultValue={user.email}
        />

        <TextField
          id="age"
          label="Age"
          name={AuthFormField.Age}
          type="number"
          min={0}
          defaultValue={user.age ?? ""}
        />

        <TextField
          id="password"
          label="New Password"
          labelSuffix={
            <span className="text-slate-400 font-normal">
              (leave blank to keep current)
            </span>
          }
          name={AuthFormField.Password}
          type="password"
          autoComplete="new-password"
        />

        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link
            to={paths.profile()}
            className={buttonStyles({ variant: "secondary" })}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={pending} size="lg">
            {pending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
