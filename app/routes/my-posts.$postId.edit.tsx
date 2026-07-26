import { data, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/my-posts.$postId.edit";
import { requireUser, requireToken } from "../lib/auth.server";
import { categoriesQuery } from "../lib/graphql/categories.server";
import { postQuery, updatePostMutation } from "../lib/graphql/posts.server";
import { GqlRequestError } from "../lib/graphql-client.server";
import { readMetadata } from "../lib/post-metadata-form";
import { PostForm } from "../components/PostForm";

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token, user } = await requireUser(request);
  const [post, categories] = await Promise.all([
    postQuery(token, params.postId),
    categoriesQuery(token),
  ]);

  if (post.author.id !== user.id) {
    throw redirect("/my-posts");
  }

  return { post, categories };
}

export async function action({ request, params }: Route.ActionArgs) {
  const token = await requireToken(request);
  const formData = await request.formData();

  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const published = formData.get("published") === "true";
  const categoryIds = formData.getAll("categoryIds").map(String);
  const metadata = readMetadata(formData);

  try {
    await updatePostMutation(token, { id: params.postId, title, content, slug, published, categoryIds, metadata });
    return redirect("/my-posts");
  } catch (error) {
    const message = error instanceof GqlRequestError ? error.message : "Could not update the post.";
    return data({ error: message }, { status: 400 });
  }
}

export default function EditPost({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const { post, categories } = loaderData;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Edit Post</h1>
        <p className="text-slate-500 mt-1">Update your post and save your changes.</p>
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
            tags: post.openGraphMetadata?.tags?.join(", "),
          },
        }}
        error={actionData?.error}
        pending={navigation.state === "submitting"}
        cancelTo="/my-posts"
        submitLabel="Save Changes"
      />
    </div>
  );
}