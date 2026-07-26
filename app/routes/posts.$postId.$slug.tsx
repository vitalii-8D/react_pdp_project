import { useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/posts.$postId.$slug";
import { requireToken } from "../lib/auth.server";
import { postQuery } from "../lib/graphql/posts.server";
import { Icons } from "../components/Icons";
import { ShareModal } from "../components/ShareModal";
import { avatarUrl } from "../lib/images";
import { formatDate } from "../lib/format";

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await requireToken(request);
  const post = await postQuery(token, params.postId);

  const siteUrl = process.env.HOST ? `https://${process.env.HOST}` : "http://localhost:3003";
  const url = `${siteUrl}/posts/${post.id}/${post.slug}`;

  return { post, url };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const { post, url } = loaderData;
  const og = post.openGraphMetadata;
  const title = og?.title ?? post.title;
  const description = og?.description ?? post.content.slice(0, 160);

  const tags: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
    { property: "og:url", content: url },
  ];

  if (og?.image) {
    tags.push({ property: "og:image", content: og.image });
    if (og.imageAlt) {
      tags.push({ property: "og:image:alt", content: og.imageAlt });
    }
  }

  if (og?.siteName) {
    tags.push({ property: "og:site_name", content: og.siteName });
  }

  tags.push({ name: "twitter:card", content: og?.image ? "summary_large_image" : "summary" });
  tags.push({ name: "twitter:title", content: title });
  tags.push({ name: "twitter:description", content: description });
  if (og?.image) {
    tags.push({ name: "twitter:image", content: og.image });
  }

  return tags;
}

export default function PostDetail({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;
  const [shareOpen, setShareOpen] = useState(false);
  const coverImage = post.openGraphMetadata?.image;

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        to="/"
        className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
      >
        <Icons.ArrowLeft />
        Back to posts
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
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

        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 hover:border-blue-200 transition-all active:scale-95"
          >
            <Icons.Share />
            Share
          </button>
        </div>
      </div>

      <ShareModal
        postId={post.id}
        postSlug={post.slug}
        postTitle={post.title}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}