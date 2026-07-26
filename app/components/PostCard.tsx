import { useState } from "react";
import { Link, useFetcher } from "react-router";

import { Icons } from "./Icons";
import { ShareModal } from "./ShareModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { avatarUrl } from "../lib/images";
import { formatDate } from "../lib/format";
import type { PostEntity } from "../lib/types";

export function PostCard({ post, currentUserId }: { post: PostEntity; currentUserId: string }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fetcher = useFetcher();
  const isOwner = post.author.id === currentUserId;
  const coverImage = post.openGraphMetadata?.image;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300">
      <Link to={`/posts/${post.id}/${post.slug}`} className="block">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <img
              className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
              src={avatarUrl(post.author.id)}
              alt={post.author.name}
            />
            <div>
              <p className="text-sm font-bold text-slate-900">{post.author.name}</p>
              <p className="text-xs text-slate-400">{formatDate(post.createdAt)}</p>
            </div>
          </div>

          {isOwner && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              Your Post
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 leading-tight">{post.title}</h2>

        {coverImage && (
          <img
            src={coverImage}
            alt={post.openGraphMetadata?.imageAlt ?? post.title}
            className="w-full max-h-72 object-cover rounded-xl mb-4"
          />
        )}

        <p className="text-slate-600 whitespace-pre-line mb-4 leading-relaxed text-sm sm:text-base">{post.content}</p>

        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 hover:border-blue-200 transition-all active:scale-95"
        >
          <Icons.Share />
          Share
        </button>

        {isOwner && (
          <div className="flex items-center space-x-2">
            <Link
              to={`/my-posts/${post.id}/edit`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all"
            >
              <Icons.Edit />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 transition-all"
              title="Delete post"
            >
              <Icons.Delete />
              <span className="ml-1">Delete</span>
            </button>
          </div>
        )}
      </div>

      <ShareModal
        postId={post.id}
        postSlug={post.slug}
        postTitle={post.title}
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
          fetcher.submit(null, { method: "post", action: `/my-posts/${post.id}/destroy` });
        }}
      />
    </div>
  );
}