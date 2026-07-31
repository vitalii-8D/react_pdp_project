import { redirect } from 'react-router';

import { getSession, destroySession, SESSION_TOKEN_KEY } from './sessions.server';
import { meQuery } from './graphql/users.server';
import { GqlRequestError } from './graphql-client.server';
import { paths } from './paths';
import type { UserEntity } from './types';

export async function getToken(request: Request): Promise<string | undefined> {
  const session = await getSession(request.headers.get('Cookie'));

  return session.get(SESSION_TOKEN_KEY);
}

export async function requireToken(request: Request): Promise<string> {
  const token = await getToken(request);
  if (!token) {
    throw redirect(paths.login());
  }

  return token;
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

export async function requireUser(request: Request): Promise<{ token: string; user: UserEntity }> {
  const token = await requireToken(request);

  try {
    const user = await meQuery(token);
    return { token, user };
  } catch (error) {
    if (error instanceof GqlRequestError && error.status === 401) {
      const session = await getSession(request.headers.get('Cookie'));
      throw redirect(paths.login(), {
        headers: { 'Set-Cookie': await destroySession(session) },
      });
    }
    throw error;
  }
}
