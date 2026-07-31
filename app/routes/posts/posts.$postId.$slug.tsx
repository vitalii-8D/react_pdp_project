import { Link } from 'react-router';

import type { Route } from './+types/posts.$postId.$slug';
import { getOptionalUser } from '../../lib/auth.server';
import { postQuery } from '../../lib/graphql/posts.server';
import { Icons } from '../../components/Icons';
import { PostAuthorMeta } from '../../components/PostAuthorMeta';
import { CategoryList } from '../../components/CategoryList';
import { PostActionsBar } from '../../components/PostActionsBar';
import { Card } from '../../components/Card';
import { getSiteUrl } from '../../lib/site-url.server';
import { paths } from '../../lib/paths';
import { buildOgMetaTags } from '../../lib/meta';

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token, user } = await getOptionalUser(request);
  const post = await postQuery(token, params.postId);
  const url = `${getSiteUrl()}${paths.postDetail(post.id, post.slug)}`;

  return { post, url, currentUserId: user?.id };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return buildOgMetaTags(loaderData.post, loaderData.url);
}

export default function PostDetail({ loaderData }: Route.ComponentProps) {
  const { post, currentUserId } = loaderData;
  const isOwner = post.author.id === currentUserId;
  const coverImage = post.openGraphMetadata?.image;

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
          <PostAuthorMeta author={post.author} createdAt={post.createdAt} />
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

        <PostActionsBar postId={post.id} postSlug={post.slug} postTitle={post.title} isOwner={isOwner} />
      </Card>
    </div>
  );
}
