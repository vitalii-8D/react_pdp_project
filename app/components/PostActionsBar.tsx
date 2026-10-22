import { useEffect, useState } from 'react';
import { Link, useFetcher } from 'react-router';

import { Icons } from './Icons';
import { ShareModal } from './ShareModal';
import { ConfirmDialog } from './ConfirmDialog';
import { Button, buttonStyles } from './Button';
import { paths } from '../lib/paths';
import { redirectToCheckout } from '../lib/checkout';
import { useStripePublishableKey } from '../hooks/useStripePublishableKey';
import { PostStatus } from '../enums/post-status.enum';
import { PostPaymentStatus } from '../enums/payment-status.enum';
import { PostFormField } from '../enums/post-form-field.enum';

interface PostActionsBarProps {
  postId: string;
  postSlug: string;
  postTitle: string;
  isOwner: boolean;
  status?: PostStatus;
  paymentStatus?: PostPaymentStatus;
  // The post's own page has nothing left to show after a delete; lists just drop the card.
  navigateAfterDelete?: boolean;
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
  navigateAfterDelete = false,
}: PostActionsBarProps) {
  const stripePublishableKey = useStripePublishableKey();
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteFetcher = useFetcher<{ error?: string }>();
  const publishFetcher = useFetcher<PublishFetcherData>();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // A paid publish comes back with a Checkout URL - a full browser navigation to Stripe's hosted
  // page, not a <Form>/redirect, since Checkout is an external domain.
  useEffect(() => {
    const checkoutUrl = publishFetcher.data?.checkoutUrl;
    if (!checkoutUrl) {
      return;
    }
    setIsRedirecting(true);
    void redirectToCheckout(checkoutUrl, stripePublishableKey);
  }, [publishFetcher.data, stripePublishableKey]);

  const needsFirstPublish = status !== undefined && status !== PostStatus.Published;
  const isFailedPayment = paymentStatus === PostPaymentStatus.Failed;
  const isPendingPayment = paymentStatus === PostPaymentStatus.Pending;
  const isPublishing = publishFetcher.state !== 'idle' || isRedirecting;
  const error =
    (publishFetcher.state === 'idle' ? publishFetcher.data?.error : undefined) ??
    (deleteFetcher.state === 'idle' ? deleteFetcher.data?.error : undefined);

  return (
    <div className="pt-4 border-t border-slate-100">
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="flex items-center justify-between">
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
                disabled={isPublishing}
                onClick={() =>
                  publishFetcher.submit(null, {
                    method: 'post',
                    action: isFailedPayment ? paths.myPostRetryPayment(postId) : paths.myPostPublish(postId),
                  })
                }
              >
                {isPublishing ? 'Redirecting…' : isFailedPayment ? 'Retry Payment' : 'Publish'}
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
            // On the post's own page the action redirects away first, so the page doesn't try to
            // reload the deleted post; a list just revalidates without it.
            deleteFetcher.submit(navigateAfterDelete ? { [PostFormField.RedirectTo]: paths.myPosts() } : null, {
              method: 'post',
              action: paths.myPostDestroy(postId),
            });
          }}
        />
      </div>
    </div>
  );
}
