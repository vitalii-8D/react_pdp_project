import type { Route } from './+types/chat.users-search';
import { requireUserFromContext } from '../../lib/auth.server';
import { searchUsersQuery } from '../../lib/graphql/users.server';
import { MIN_QUERY_LENGTH } from '../../lib/search-constants';

export async function loader({ request, context }: Route.LoaderArgs) {
  const { token } = await requireUserFromContext(request, context);
  const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';

  if (query.length < MIN_QUERY_LENGTH) {
    return { users: [] };
  }

  const users = await searchUsersQuery(token, query);
  return { users };
}
