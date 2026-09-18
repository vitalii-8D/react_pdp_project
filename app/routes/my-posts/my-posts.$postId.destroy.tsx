import { redirect } from 'react-router';

import type { Route } from './+types/my-posts.$postId.destroy';
import { requireTokenFromContext } from '../../lib/auth.server';
import { removePostMutation } from '../../lib/graphql/posts.server';
import { paths } from '../../lib/paths';

export async function action({ params, context }: Route.ActionArgs) {
  const token = requireTokenFromContext(context);
  await removePostMutation(token, params.postId);

  return redirect(paths.myPosts());
}
