import { redirect, useNavigation } from "react-router";

import type { Route } from "./+types/my-posts.$postId.edit";
import { requireUser, requireToken } from "../../lib/auth.server";
import { categoriesQuery } from "../../lib/graphql/categories.server";
import {
  postQuery,
  updatePostMutation,
  parsePostFormInput,
} from "../../lib/graphql/posts.server";
import { toActionError } from "../../lib/graphql-client.server";
import { paths } from "../../lib/paths";
import { PostForm } from "../../components/PostForm";

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token, user } = await requireUser(request);
  const [post, categories] = await Promise.all([
    postQuery(token, params.postId),
    categoriesQuery(token),
  ]);

  if (post.author.id !== user.id) {
    throw redirect(paths.myPosts());
  }

  return { post, categories };
}

export async function action({ request, params }: Route.ActionArgs) {
  const token = await requireToken(request);
  const formData = await request.formData();
  const input = await parsePostFormInput(token, formData);

  try {
    await updatePostMutation(token, { id: params.postId, ...input });
    return redirect(paths.myPosts());
  } catch (error) {
    return toActionError(error, "Could not update the post.");
  }
}

export default function EditPost({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const { post, categories } = loaderData;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Edit Post
        </h1>
        <p className="text-slate-500 mt-1">
          Update your post and save your changes.
        </p>
      </div>

      <PostForm
        categories={categories}
        defaultValues={{
          title: post.title,
          content: post.content,
          slug: post.slug,
          published: post.published,
          categoryIds: post.categories?.map((category) => category.id) ?? [],
          metadata: {
            image: post.openGraphMetadata?.image ?? undefined,
            imageAlt: post.openGraphMetadata?.imageAlt ?? undefined,
          },
        }}
        error={actionData?.error}
        pending={navigation.state === "submitting"}
        cancelTo={paths.myPosts()}
        submitLabel="Save Changes"
      />
    </div>
  );
}
