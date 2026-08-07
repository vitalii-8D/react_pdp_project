import { data } from 'react-router';

import type { Route } from './+types/posts.$postId.comments.$commentId';
import { requireToken } from '../../lib/auth.server';
import { updateCommentMutation } from '../../lib/graphql/comments.server';
import { CommentFormField } from '../../enums/comment-form-field.enum';
import { toActionError } from '../../lib/graphql-client.server';

export async function action({ request, params }: Route.ActionArgs) {
  const token = await requireToken(request);
  const formData = await request.formData();
  const content = String(formData.get(CommentFormField.Content) ?? '');
  const rating = Number(formData.get(CommentFormField.Rating));

  try {
    await updateCommentMutation(token, { id: params.commentId, content, rating });
    return data({ ok: true });
  } catch (error) {
    return toActionError(error, 'Could not update your comment.');
  }
}
