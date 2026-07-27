import { Link } from "react-router";

import type { Route } from "./+types/my-posts";
import { requireUser } from "../../lib/auth.server";
import { myPostsQuery } from "../../lib/graphql/posts.server";
import { paths } from "../../lib/paths";
import { PostCard } from "../../components/PostCard";
import { Icons } from "../../components/Icons";
import { Card } from "../../components/Card";
import { buttonStyles } from "../../components/Button";

export async function loader({ request }: Route.LoaderArgs) {
  const { token, user } = await requireUser(request);
  const posts = await myPostsQuery(token);

  return { posts, currentUserId: user.id };
}

export default function MyPosts({ loaderData }: Route.ComponentProps) {
  const { posts, currentUserId } = loaderData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            My Posts
          </h1>
          <p className="text-slate-500 mt-1">
            Manage the posts you&apos;ve written.
          </p>
        </div>
        <Link
          to={paths.myPostsNew()}
          className={buttonStyles({ size: "lg", className: "self-start" })}
        >
          <Icons.Plus />
          Create Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-400 text-lg">
            You haven&apos;t written any posts yet.
          </p>
          <Link
            to={paths.myPostsNew()}
            className={buttonStyles({ size: "lg", className: "mt-4" })}
          >
            <Icons.Plus /> Create your first post
          </Link>
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
