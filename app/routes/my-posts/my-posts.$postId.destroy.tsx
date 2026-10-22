import { data, redirect } from 'react-router';

import type { Route } from './+types/my-posts.$postId.destroy';
import { requireTokenFromContext } from '../../lib/auth.server';
import { removePostMutation } from '../../lib/graphql/posts.server';
import { toActionError } from '../../lib/graphql-client.server';
import { safeRedirectPath } from '../../lib/safe-redirect';
import { PostFormField } from '../../enums/post-form-field.enum';

export async function action({ request, params, context }: Route.ActionArgs) {
  const token = requireTokenFromContext(context);
  const formData = await request.formData();
  const redirectTo = formData.get(PostFormField.RedirectTo);

  try {
    await removePostMutation(token, params.postId);
  } catch (error) {
    return toActionError(error, 'Could not delete the post.');
  }

  // Lists (feed, My Posts) just revalidate without the post; the post's own page asks to leave.
  return redirectTo ? redirect(safeRedirectPath(String(redirectTo))) : data({ ok: true });
}
