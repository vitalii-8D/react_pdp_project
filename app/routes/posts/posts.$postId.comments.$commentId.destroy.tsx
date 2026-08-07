import { data } from 'react-router';

import type { Route } from './+types/posts.$postId.comments.$commentId.destroy';
import { requireToken } from '../../lib/auth.server';
import { removeCommentMutation } from '../../lib/graphql/comments.server';
import { toActionError } from '../../lib/graphql-client.server';

export async function action({ request, params }: Route.ActionArgs) {
  const token = await requireToken(request);

  try {
    await removeCommentMutation(token, params.commentId);
    return data({ ok: true });
  } catch (error) {
    return toActionError(error, 'Could not delete this comment.');
  }
}
