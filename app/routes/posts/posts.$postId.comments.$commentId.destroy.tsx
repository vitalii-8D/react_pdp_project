import { data } from 'react-router';

import type { Route } from './+types/posts.$postId.comments.$commentId.destroy';
import { requireTokenFromContext } from '../../lib/auth.server';
import { removeCommentMutation } from '../../lib/graphql/comments.server';
import { toActionError } from '../../lib/graphql-client.server';

export async function action({ params, context }: Route.ActionArgs) {
  const token = requireTokenFromContext(context);

  try {
    await removeCommentMutation(token, params.commentId);
    return data({ ok: true });
  } catch (error) {
    return toActionError(error, 'Could not delete this comment.');
  }
}
