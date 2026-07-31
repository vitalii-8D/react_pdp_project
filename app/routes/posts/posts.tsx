import type { Route } from './+types/posts';
import { getOptionalUser } from '../../lib/auth.server';
import { postsQuery } from '../../lib/graphql/posts.server';
import { PostCard } from '../../components/PostCard';
import { Card } from '../../components/Card';

export async function loader({ request }: Route.LoaderArgs) {
  const { token, user } = await getOptionalUser(request);
  const posts = await postsQuery(token);

  return { posts, currentUserId: user?.id };
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
        <Card className="p-12 text-center">
          <p className="text-slate-400 text-lg">No posts from other users yet.</p>
        </Card>
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
