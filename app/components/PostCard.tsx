import { Link } from 'react-router';

import { PostAuthorMeta } from './PostAuthorMeta';
import { CategoryList } from './CategoryList';
import { PostActionsBar } from './PostActionsBar';
import { Card } from './Card';
import { paths } from '../lib/paths';
import type { PostEntity } from '../lib/types';

export function PostCard({ post, currentUserId }: { post: PostEntity; currentUserId?: string }) {
  const isOwner = post.author.id === currentUserId;
  const coverImage = post.openGraphMetadata?.image;

  return (
    <Card className="p-6 sm:p-8 transition-all duration-300 hover:shadow-md hover:border-slate-300">
      <Link to={paths.postDetail(post.id, post.slug)} className="block">
        <div className="flex justify-between items-start mb-4">
          <PostAuthorMeta
            author={post.author}
            createdAt={post.createdAt}
            readingTimeMinutes={post.readingTimeMinutes}
            viewCount={post.viewCount}
          />

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

        <CategoryList categories={post.categories} />
      </Link>

      <PostActionsBar postId={post.id} postSlug={post.slug} postTitle={post.title} isOwner={isOwner} />
    </Card>
  );
}
