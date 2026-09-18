import type { Route } from './+types/posts.$postId.share-links';
import { getOptionalUserFromContext } from '../../lib/auth.server';
import { generateShareLinksQuery } from '../../lib/graphql/open-graph.server';
import { toActionError } from '../../lib/graphql-client.server';
import { getSiteUrl } from '../../lib/site-url.server';

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const { token } = getOptionalUserFromContext(context);
  const slug = new URL(request.url).searchParams.get('slug');
  const url = slug ? `${getSiteUrl()}/posts/${params.postId}/${slug}` : `${getSiteUrl()}/posts/${params.postId}`;

  try {
    const shareLinks = await generateShareLinksQuery(token, url, params.postId);
    return { shareLinks };
  } catch (error) {
    return toActionError(error, 'Could not load share links.');
  }
}
