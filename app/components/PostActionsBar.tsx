import { useState } from 'react';
import { Link, useFetcher } from 'react-router';

import { Icons } from './Icons';
import { ShareModal } from './ShareModal';
import { ConfirmDialog } from './ConfirmDialog';
import { Button, buttonStyles } from './Button';
import { paths } from '../lib/paths';

interface PostActionsBarProps {
  postId: string;
  postSlug: string;
  postTitle: string;
  isOwner: boolean;
}

export function PostActionsBar({ postId, postSlug, postTitle, isOwner }: PostActionsBarProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fetcher = useFetcher();

  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <Button type="button" variant="chip" size="sm" onClick={() => setShareOpen(true)}>
        <Icons.Share />
        Share
      </Button>

      {isOwner && (
        <div className="flex items-center space-x-2">
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
