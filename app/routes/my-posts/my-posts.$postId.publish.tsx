import { redirect } from 'react-router';

import type { Route } from './+types/my-posts.$postId.publish';
import { requireToken } from '../../lib/auth.server';
import { publishPostMutation } from '../../lib/graphql/payments.server';
import { toActionError } from '../../lib/graphql-client.server';
import { paths } from '../../lib/paths';

export async function action({ request, params }: Route.ActionArgs) {
  const token = await requireToken(request);

  try {
    const result = await publishPostMutation(token, params.postId);

    if (result.checkoutUrl) {
      // Free republish (post has been published before) resolves synchronously with no
      // checkout — anything else means Stripe Checkout is required, handled client-side.
      return { checkoutUrl: result.checkoutUrl, checkoutSessionId: result.checkoutSessionId };
    }

    return redirect(paths.myPosts());
  } catch (error) {
    return toActionError(error, 'Unable to publish this post.');
  }
}
