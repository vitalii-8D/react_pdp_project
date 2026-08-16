import type { Route } from './+types/my-posts.$postId.retry-payment';
import { requireToken } from '../../lib/auth.server';
import { retryPostPaymentMutation } from '../../lib/graphql/payments.server';
import { toActionError } from '../../lib/graphql-client.server';

export async function action({ request, params }: Route.ActionArgs) {
  const token = await requireToken(request);

  try {
    const result = await retryPostPaymentMutation(token, params.postId);
    return { checkoutUrl: result.checkoutUrl, checkoutSessionId: result.checkoutSessionId };
  } catch (error) {
    return toActionError(error, 'Unable to retry this payment.');
  }
}
