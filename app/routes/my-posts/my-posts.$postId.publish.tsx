import { redirect } from 'react-router';

import type { Route } from './+types/my-posts.$postId.publish';
import { requireTokenFromContext } from '../../lib/auth.server';
import { publishPostMutation } from '../../lib/graphql/payments.server';
import { toActionError } from '../../lib/graphql-client.server';
import { paths } from '../../lib/paths';

export async function action({ params, context }: Route.ActionArgs) {
  const token = requireTokenFromContext(context);

  try {
    const result = await publishPostMutation(token, params.postId);

    if (result.checkoutUrl) {
      return { checkoutUrl: result.checkoutUrl, checkoutSessionId: result.checkoutSessionId };
    }

    return redirect(paths.myPosts());
  } catch (error) {
    return toActionError(error, 'Unable to publish this post.');
  }
}
