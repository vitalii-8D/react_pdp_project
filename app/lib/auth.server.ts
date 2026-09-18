import { redirect, type RouterContextProvider } from 'react-router';

import { getSession, destroySession, SESSION_TOKEN_KEY } from './sessions.server';
import { meQuery } from './graphql/users.server';
import { GqlRequestError } from './graphql-client.server';
import { paths } from './paths';
import { authContext } from './auth-context.server';
import type { UserEntity } from './types';

type AuthContext = Readonly<RouterContextProvider>;

export async function getToken(request: Request): Promise<string | undefined> {
  const session = await getSession(request.headers.get('Cookie'));

  return session.get(SESSION_TOKEN_KEY);
}

export async function getOptionalUser(request: Request): Promise<{ token?: string; user?: UserEntity }> {
  const token = await getToken(request);
  if (!token) {
    return {};
  }

  try {
    const user = await meQuery(token);
    return { token, user };
  } catch (error) {
    if (error instanceof GqlRequestError && error.status === 401) {
      return {};
    }
    throw error;
  }
}

export async function authMiddleware({ request, context }: { request: Request; context: AuthContext }) {
  const token = await getToken(request);
  if (!token) {
    context.set(authContext, {});
    return;
  }

  try {
    const user = await meQuery(token);
    context.set(authContext, { token, user });
  } catch (error) {
    if (error instanceof GqlRequestError && error.status === 401) {
      context.set(authContext, { invalidSession: true });
      return;
    }
    throw error;
  }
}

export function getOptionalUserFromContext(context: AuthContext): { token?: string; user?: UserEntity } {
  const { token, user } = context.get(authContext);
  return { token, user };
}

export function requireTokenFromContext(context: AuthContext): string {
  const { token } = context.get(authContext);
  if (!token) {
    throw redirect(paths.login());
  }

  return token;
}

export async function requireUserFromContext(
  request: Request,
  context: AuthContext,
): Promise<{ token: string; user: UserEntity }> {
  const { token, user, invalidSession } = context.get(authContext);

  if (token && user) {
    return { token, user };
  }

  if (invalidSession) {
    const session = await getSession(request.headers.get('Cookie'));
    throw redirect(paths.login(), {
      headers: { 'Set-Cookie': await destroySession(session) },
    });
  }

  throw redirect(paths.login());
}
