import type { Route } from './+types/my-posts.$postId.retry-payment';
import { requireTokenFromContext } from '../../lib/auth.server';
import { retryPostPaymentMutation } from '../../lib/graphql/payments.server';
import { toActionError } from '../../lib/graphql-client.server';

export async function action({ params, context }: Route.ActionArgs) {
  const token = requireTokenFromContext(context);

  try {
    const result = await retryPostPaymentMutation(token, params.postId);
    return { checkoutUrl: result.checkoutUrl, checkoutSessionId: result.checkoutSessionId };
  } catch (error) {
    return toActionError(error, 'Unable to retry this payment.');
  }
}
