import { redirect } from 'react-router';

import type { Route } from './+types/logout';
import { getSession, destroySession } from '../../lib/sessions.server';
import { paths } from '../../lib/paths';

export async function loader() {
  return redirect(paths.posts());
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  return redirect(paths.login(), {
    headers: { 'Set-Cookie': await destroySession(session) },
  });
}
