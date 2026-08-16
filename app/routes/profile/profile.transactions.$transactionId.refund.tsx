import type { Route } from './+types/profile.transactions.$transactionId.refund';
import { requireToken } from '../../lib/auth.server';
import { refundPaymentMutation } from '../../lib/graphql/payments.server';
import { toActionError } from '../../lib/graphql-client.server';

export async function action({ request, params }: Route.ActionArgs) {
  const token = await requireToken(request);

  try {
    const transaction = await refundPaymentMutation(token, params.transactionId);
    return { transaction };
  } catch (error) {
    return toActionError(error, 'Unable to process refund.');
  }
}
