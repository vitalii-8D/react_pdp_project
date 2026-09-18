import { data } from 'react-router';

import type { Route } from './+types/posts.$postId.comments';
import { requireTokenFromContext } from '../../lib/auth.server';
import { createCommentMutation } from '../../lib/graphql/comments.server';
import { CommentFormField } from '../../enums/comment-form-field.enum';
import { toActionError } from '../../lib/graphql-client.server';

export async function action({ request, params, context }: Route.ActionArgs) {
  const token = requireTokenFromContext(context);
  const formData = await request.formData();
  const content = String(formData.get(CommentFormField.Content) ?? '');
  const rating = Number(formData.get(CommentFormField.Rating));

  try {
    await createCommentMutation(token, { postId: params.postId, content, rating });
    return data({ ok: true });
  } catch (error) {
    return toActionError(error, 'Could not post your comment.');
  }
}
