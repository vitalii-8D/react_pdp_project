import { useEffect, useRef } from 'react';
import { data, Link, useFetcher } from 'react-router';

import type { Route } from './+types/posts.$postId.$slug';
import { getOptionalUserFromContext } from '../../lib/auth.server';
import { postQuery } from '../../lib/graphql/posts.server';
import { commentsByPostQuery } from '../../lib/graphql/comments.server';
import { errorMessage } from '../../lib/graphql-client.server';
import { Icons } from '../../components/Icons';
import { PostAuthorMeta } from '../../components/PostAuthorMeta';
import { CategoryList } from '../../components/CategoryList';
import { PostActionsBar } from '../../components/PostActionsBar';
import { CommentList } from '../../components/CommentList';
import { CommentForm } from '../../components/CommentForm';
import { Card } from '../../components/Card';
import { ErrorMessage } from '../../components/PageStatus';
import { getSiteUrl } from '../../lib/site-url.server';
import { paths } from '../../lib/paths';
import { buildOgMetaTags } from '../../lib/meta';

export async function loader({ params, context }: Route.LoaderArgs) {
  const { token, user } = getOptionalUserFromContext(context);
  // Post and comments load in parallel and independently: a failed comments request still renders
  // the post, with the error in place of the list.
  const [post, commentsResult] = await Promise.all([
    postQuery(token, params.postId),
    commentsByPostQuery(params.postId, token).then(
      (comments) => ({ comments, commentsError: undefined }),
      (error: unknown) => ({ comments: undefined, commentsError: errorMessage(error, 'Could not load comments.') }),
    ),
  ]);
  const url = `${getSiteUrl()}${paths.postDetail(post.id, post.slug)}`;

  // Only cache anonymous responses in shared caches — the page is personalized
  // (isOwner actions, comment form vs. login prompt) once a viewer is logged in.
  const cacheControl = user ? 'private, no-store' : 'public, max-age=60, stale-while-revalidate=300';

  return data(
    { post, ...commentsResult, url, currentUserId: user?.id },
    { headers: { 'Cache-Control': cacheControl } },
  );
}

export function meta({ loaderData }: Route.MetaArgs) {
  return buildOgMetaTags(loaderData.post, loaderData.url);
}

export function headers({ loaderHeaders }: Route.HeadersArgs): HeadersInit {
  return { 'Cache-Control': loaderHeaders.get('Cache-Control') ?? 'private, no-store' };
}

export default function PostDetail({ loaderData }: Route.ComponentProps) {
  const { post, comments, commentsError, currentUserId } = loaderData;
  const isOwner = post.author.id === currentUserId;
  const coverImage = post.openGraphMetadata?.image;

  // One view per post visit, counted from the browser rather than the loader - the loader re-runs
  // on every revalidation (each comment action) and would count those too. Guarded so StrictMode's
  // effect re-run doesn't count twice, and it doesn't revalidate this page (nothing shown changes).
  const viewFetcher = useFetcher();
  const countedPostId = useRef<string | null>(null);
  useEffect(() => {
    if (countedPostId.current === post.id) {
      return;
    }
    countedPostId.current = post.id;
    void viewFetcher.submit(null, { method: 'post', action: paths.postView(post.id), defaultShouldRevalidate: false });
    // fetcher identity changes every render by design; only re-run for another post.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  return (
    <div className="space-y-6">
      <Link
        to={paths.posts()}
        className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
      >
        <Icons.ArrowLeft />
        Back to posts
      </Link>

      <Card className="p-6 sm:p-8">
        <div className="mb-4">
          <PostAuthorMeta
            author={post.author}
            createdAt={post.createdAt}
            readingTimeMinutes={post.readingTimeMinutes}
            viewCount={post.viewCount}
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
          {post.title}
        </h1>

        {coverImage && (
          <img
            src={coverImage}
            alt={post.openGraphMetadata?.imageAlt ?? post.title}
            className="w-full max-h-96 object-cover rounded-xl mb-6"
          />
        )}

        <p className="text-slate-600 whitespace-pre-line mb-6 leading-relaxed">{post.content}</p>

        <CategoryList categories={post.categories} />

        <PostActionsBar
          postId={post.id}
          postSlug={post.slug}
          postTitle={post.title}
          isOwner={isOwner}
          status={post.status}
          paymentStatus={post.paymentStatus}
          navigateAfterDelete
        />
      </Card>

      <Card className="p-6 sm:p-8 space-y-4">
        {currentUserId && !isOwner && <CommentForm action={paths.postComments(post.id)} submitLabel="Post Comment" />}

        {!currentUserId && (
          <p className="text-sm text-slate-500">
            <Link to={paths.login(paths.postDetail(post.id, post.slug))} className="text-blue-600 font-semibold">
              Log in
            </Link>{' '}
            to leave a comment.
          </p>
        )}

        {commentsError ? (
          <ErrorMessage message={commentsError} />
        ) : (
          comments && <CommentList comments={comments} postId={post.id} currentUserId={currentUserId} />
        )}
      </Card>
    </div>
  );
}
