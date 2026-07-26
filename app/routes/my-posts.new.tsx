import { data, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/my-posts.new";
import { requireToken } from "../lib/auth.server";
import { categoriesQuery } from "../lib/graphql/categories.server";
import {
  createPostMutation,
  type PostMetadataInput,
} from "../lib/graphql/posts.server";
import { GqlRequestError } from "../lib/graphql-client.server";
import { PostForm } from "../components/PostForm";

export async function loader({ request }: Route.LoaderArgs) {
  const token = await requireToken(request);
  const categories = await categoriesQuery(token);
  return { categories };
}

export async function action({ request }: Route.ActionArgs) {
  const token = await requireToken(request);
  const formData = await request.formData();

  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const published = formData.get("published") === "true";
  const categoryIds = formData.getAll("categoryIds").map(String);
  const image = String(formData.get("image") ?? "").trim();
  const imageAlt = String(formData.get("imageAlt") ?? "").trim();

  const categories = await categoriesQuery(token);
  const tags = categories
    .filter((category) => categoryIds.includes(category.id))
    .map((category) => category.name.toLowerCase());

  let metadata: PostMetadataInput | undefined = undefined;
  if (image || imageAlt || tags.length) {
    metadata = {
      ...(image && { image }),
      ...(imageAlt && { imageAlt }),
      ...(tags.length && { tags }),
    };
  }

  try {
    await createPostMutation(token, {
      title,
      content,
      slug,
      published,
      categoryIds,
      metadata,
    });
    return redirect("/my-posts");
  } catch (error) {
    const message =
      error instanceof GqlRequestError
        ? error.message
        : "Could not create the post.";
    return data({ error: message }, { status: 400 });
  }
}

export default function NewPost({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Create Post
        </h1>
        <p className="text-slate-500 mt-1">
          Share something new with the community.
        </p>
      </div>

      <PostForm
        categories={loaderData.categories}
        error={actionData?.error}
        pending={navigation.state === "submitting"}
        cancelTo="/my-posts"
        submitLabel="Publish"
      />
    </div>
  );
}
