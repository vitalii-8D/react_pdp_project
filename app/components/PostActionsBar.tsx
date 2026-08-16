import { useEffect, useState } from 'react';
import { Link, useFetcher } from 'react-router';
import { loadStripe } from '@stripe/stripe-js';

import { Icons } from './Icons';
import { ShareModal } from './ShareModal';
import { ConfirmDialog } from './ConfirmDialog';
import { Button, buttonStyles } from './Button';
import { paths } from '../lib/paths';
import { PostStatus } from '../enums/post-status.enum';
import { PostPaymentStatus } from '../enums/payment-status.enum';

interface PostActionsBarProps {
  postId: string;
  postSlug: string;
  postTitle: string;
  isOwner: boolean;
  status?: PostStatus;
  paymentStatus?: PostPaymentStatus;
  stripePublishableKey?: string;
}

interface PublishFetcherData {
  checkoutUrl?: string | null;
  error?: string;
}

export function PostActionsBar({
  postId,
  postSlug,
  postTitle,
  isOwner,
  status,
  paymentStatus,
  stripePublishableKey,
}: PostActionsBarProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fetcher = useFetcher();
  const publishFetcher = useFetcher<PublishFetcherData>();

  useEffect(() => {
    const checkoutUrl = publishFetcher.data?.checkoutUrl;
    if (!checkoutUrl) {
      return;
    }
    // Stripe's hosted Checkout redirect only needs the session URL — `stripe.redirectToCheckout`
    // was removed from @stripe/stripe-js. Loading Stripe.js first is still Stripe's recommended
    // practice on any page that completes a payment (it initializes their fraud-detection
    // scripts), so we load it even though this flow doesn't call a Stripe.js method directly.
    if (stripePublishableKey) {
      void loadStripe(stripePublishableKey);
    }
    window.location.href = checkoutUrl;
  }, [publishFetcher.data, stripePublishableKey]);

  const needsFirstPublish = status !== undefined && status !== PostStatus.PUBLISHED;
  const isFailedPayment = paymentStatus === PostPaymentStatus.Failed;
  const isPendingPayment = paymentStatus === PostPaymentStatus.Pending;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <Button type="button" variant="chip" size="sm" onClick={() => setShareOpen(true)}>
        <Icons.Share />
        Share
      </Button>

      {isOwner && (
        <div className="flex items-center space-x-2">
          {isPendingPayment && (
            <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-100">
              Payment Pending
            </span>
          )}

          {needsFirstPublish && !isPendingPayment && (
            <Button
              type="button"
              variant="chip"
              size="sm"
              disabled={publishFetcher.state !== 'idle'}
              onClick={() =>
                publishFetcher.submit(null, {
                  method: 'post',
                  action: isFailedPayment ? paths.myPostRetryPayment(postId) : paths.myPostPublish(postId),
                })
              }
            >
              {publishFetcher.state !== 'idle' ? 'Redirecting…' : isFailedPayment ? 'Retry Payment' : 'Publish'}
            </Button>
          )}

          <Link to={paths.myPostEdit(postId)} className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
            <Icons.Edit />
            Edit
          </Link>
          <Button type="button" variant="danger" size="sm" onClick={() => setConfirmOpen(true)} title="Delete post">
            <Icons.Delete />
            <span className="ml-1">Delete</span>
          </Button>
        </div>
      )}

      <ShareModal
        postId={postId}
        postSlug={postSlug}
        postTitle={postTitle}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this post?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          fetcher.submit(null, {
            method: 'post',
            action: paths.myPostDestroy(postId),
          });
        }}
      />
    </div>
  );
}
