import type { Route } from './+types/chat.users-search';
import { requireUserFromContext } from '../../lib/auth.server';
import { searchUsersQuery } from '../../lib/graphql/users.server';
import { errorMessage } from '../../lib/graphql-client.server';
import { MIN_QUERY_LENGTH } from '../../lib/search-constants';
import type { UserEntity } from '../../lib/types';

export async function loader({ request, context }: Route.LoaderArgs) {
  const { token } = await requireUserFromContext(request, context);
  const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';

  // `query` is echoed back so UserSearch only shows results for what is currently typed.
  if (query.length < MIN_QUERY_LENGTH) {
    return { query, users: [] as UserEntity[] };
  }

  try {
    const { items } = await searchUsersQuery(token, { query });

    return { query, users: items };
  } catch (error) {
    return { query, users: [] as UserEntity[], error: errorMessage(error, 'Could not search users.') };
  }
}
