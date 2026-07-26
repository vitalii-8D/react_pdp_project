import type { Route } from "./+types/posts";
import { requireUser } from "../lib/auth.server";
import { postsQuery } from "../lib/graphql/posts.server";
import { PostCard } from "../components/PostCard";

export async function loader({ request }: Route.LoaderArgs) {
  const { token, user } = await requireUser(request);
  const allPosts = await postsQuery(token);
  const posts = allPosts.filter((post) => post.author.id !== user.id);

  return { posts, currentUserId: user.id };
}

export default function Posts({ loaderData }: Route.ComponentProps) {
  const { posts, currentUserId } = loaderData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Community Posts</h1>
        <p className="text-slate-500 mt-1">Explore what other creators have shared.</p>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <p className="text-slate-400 text-lg">No posts from other users yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}