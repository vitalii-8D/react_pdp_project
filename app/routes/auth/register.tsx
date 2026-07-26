import {
  redirect,
  Form,
  Link,
  useNavigation,
  useSearchParams,
} from "react-router";

import type { Route } from "./+types/register";
import {
  getSession,
  commitSession,
  SESSION_TOKEN_KEY,
} from "../../lib/sessions.server";
import {
  createUserMutation,
  loginMutation,
} from "../../lib/graphql/users.server";
import { toActionError } from "../../lib/graphql-client.server";
import { safeRedirectPath } from "../../lib/safe-redirect";
import { AuthFormField } from "../../enums/auth-form-field.enum";
import { paths } from "../../lib/paths";
import { AuthLayout } from "../../components/AuthLayout";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";
import { cardClassName } from "../../components/Card";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has(SESSION_TOKEN_KEY)) {
    const from = new URL(request.url).searchParams.get("from");
    throw redirect(safeRedirectPath(from));
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = String(formData.get(AuthFormField.Name) ?? "");
  const email = String(formData.get(AuthFormField.Email) ?? "");
  const password = String(formData.get(AuthFormField.Password) ?? "");
  const ageRaw = String(formData.get(AuthFormField.Age) ?? "");
  const age = ageRaw ? Number(ageRaw) : undefined;
  const from = safeRedirectPath(String(formData.get(AuthFormField.From) ?? ""));

  try {
    await createUserMutation({ name, email, password, age });
    // createUser doesn't return a token, so log in immediately after registering.
    const { access_token } = await loginMutation(email, password);
    const session = await getSession(request.headers.get("Cookie"));
    session.set(SESSION_TOKEN_KEY, access_token);

    return redirect(from, {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  } catch (error) {
    return toActionError(error, "Something went wrong. Please try again.");
  }
}

export default function Register({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const pending = navigation.state === "submitting";
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") ?? "";

  return (
    <AuthLayout
      heading="Create your account"
      subtitle="Join PostShare to start posting"
      from={from}
      switchPrompt={
        <>
          Already have an account?{" "}
          <Link
            to={paths.login(from)}
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <Form method="post" className={`${cardClassName} p-6 space-y-4`}>
        <input type="hidden" name={AuthFormField.From} value={from} />
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
          autoComplete="name"
        />
        <TextField
          id="email"
          label="Email"
          name={AuthFormField.Email}
          type="email"
          required
          autoComplete="email"
        />
        <TextField
          id="password"
          label="Password"
          name={AuthFormField.Password}
          type="password"
          required
          autoComplete="new-password"
        />
        <TextField
          id="age"
          label="Age"
          labelSuffix={
            <span className="text-slate-400 font-normal">(optional)</span>
          }
          name={AuthFormField.Age}
          type="number"
          min={0}
        />
        <Button type="submit" disabled={pending} size="lg" className="w-full">
          {pending ? "Creating account…" : "Sign up"}
        </Button>
      </Form>
    </AuthLayout>
  );
}
