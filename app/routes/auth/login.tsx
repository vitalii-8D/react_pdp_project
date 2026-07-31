import { data, redirect, Form, Link, useNavigation, useSearchParams } from 'react-router';

import type { Route } from './+types/login';
import { getSession, commitSession, destroySession, SESSION_TOKEN_KEY } from '../../lib/sessions.server';
import { loginMutation } from '../../lib/graphql/users.server';
import { toActionError } from '../../lib/graphql-client.server';
import { getOptionalUser } from '../../lib/auth.server';
import { safeRedirectPath } from '../../lib/safe-redirect';
import { AuthFormField } from '../../enums/auth-form-field.enum';
import { paths } from '../../lib/paths';
import { AuthLayout } from '../../components/AuthLayout';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { cardClassName } from '../../components/Card';

export async function loader({ request }: Route.LoaderArgs) {
  const { user } = await getOptionalUser(request);
  if (user) {
    const from = new URL(request.url).searchParams.get('from');
    throw redirect(safeRedirectPath(from));
  }

  const session = await getSession(request.headers.get('Cookie'));
  if (session.has(SESSION_TOKEN_KEY)) {
    return data(null, {
      headers: { 'Set-Cookie': await destroySession(session) },
    });
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get(AuthFormField.Email) ?? '');
  const password = String(formData.get(AuthFormField.Password) ?? '');
  const from = safeRedirectPath(String(formData.get(AuthFormField.From) ?? ''));

  try {
    const { accessToken } = await loginMutation(email, password);
    const session = await getSession(request.headers.get('Cookie'));
    session.set(SESSION_TOKEN_KEY, accessToken);

    return redirect(from, {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  } catch (error) {
    return toActionError(error);
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const pending = navigation.state === 'submitting';
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') ?? '';

  return (
    <AuthLayout
      heading="Welcome back"
      subtitle="Sign in to continue to PostShare"
      from={from}
      switchPrompt={
        <>
          Don&apos;t have an account?{' '}
          <Link to={paths.register(from)} className="text-blue-600 font-semibold hover:underline">
            Sign up
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
        <TextField id="email" label="Email" name={AuthFormField.Email} type="email" required autoComplete="email" />
        <TextField
          id="password"
          label="Password"
          name={AuthFormField.Password}
          type="password"
          required
          autoComplete="current-password"
        />
        <Button type="submit" disabled={pending} size="lg" className="w-full">
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </Form>
    </AuthLayout>
  );
}
