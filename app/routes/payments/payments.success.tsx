import { Link, redirect } from 'react-router';

import type { Route } from './+types/payments.success';
import { requireToken } from '../../lib/auth.server';
import { transactionsForPostQuery } from '../../lib/graphql/payments.server';
import { PaymentTransactionStatus } from '../../enums/payment-status.enum';
import { paths } from '../../lib/paths';
import { Card } from '../../components/Card';
import { buttonStyles } from '../../components/Button';

export async function loader({ request }: Route.LoaderArgs) {
  const token = await requireToken(request);
  const url = new URL(request.url);
  const postId = url.searchParams.get('postId');

  if (!postId) {
    throw redirect(paths.myPosts());
  }

  // Stripe confirms payment asynchronously via webhook — this page just displays whatever the
  // webhook has already written to the transaction, it never checks or polls Stripe itself.
  // If the webhook hasn't landed yet, the transaction is still PENDING and the page says so.
  const transactions = await transactionsForPostQuery(token, postId);
  const latestTransaction = transactions[0];

  if (!latestTransaction) {
    return { postId, status: null as PaymentTransactionStatus | null, failureReason: undefined };
  }

  return {
    postId,
    status: latestTransaction.status,
    failureReason: latestTransaction.failureReason,
  };
}

export default function PaymentsSuccess({ loaderData }: Route.ComponentProps) {
  const { postId, status, failureReason } = loaderData;

  return (
    <div className="max-w-xl mx-auto">
      <Card className="p-8 text-center">
        {status === PaymentTransactionStatus.Succeeded && (
          <>
            <h1 className="text-2xl font-black text-slate-900">Payment successful</h1>
            <p className="text-slate-500 mt-2">Your post has been published.</p>
          </>
        )}

        {status === PaymentTransactionStatus.Pending && (
          <>
            <h1 className="text-2xl font-black text-slate-900">Payment processing</h1>
            <p className="text-slate-500 mt-2">
              We&apos;re still confirming your payment with Stripe — check back on My Posts shortly.
            </p>
          </>
        )}

        {status === PaymentTransactionStatus.Failed && (
          <>
            <h1 className="text-2xl font-black text-slate-900">Payment failed</h1>
            <p className="text-slate-500 mt-2">{failureReason ?? 'Something went wrong with your payment.'}</p>
          </>
        )}

        {!status && (
          <>
            <h1 className="text-2xl font-black text-slate-900">No payment found</h1>
            <p className="text-slate-500 mt-2">We couldn&apos;t find a payment attempt for this post.</p>
          </>
        )}

        <div className="flex items-center justify-center gap-3 mt-6">
          <Link to={paths.myPosts()} className={buttonStyles({ size: 'lg' })}>
            Go to My Posts
          </Link>
          {status === PaymentTransactionStatus.Failed && postId && (
            <Link to={paths.myPostEdit(postId)} className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
              Back to Post
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
