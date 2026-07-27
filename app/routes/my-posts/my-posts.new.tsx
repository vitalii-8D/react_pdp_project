import { redirect, useNavigation } from "react-router";

import type { Route } from "./+types/my-posts.new";
import { requireToken } from "../../lib/auth.server";
import { categoriesQuery } from "../../lib/graphql/categories.server";
import {
  createPostMutation,
  parsePostFormInput,
} from "../../lib/graphql/posts.server";
import { toActionError } from "../../lib/graphql-client.server";
import { paths } from "../../lib/paths";
import { PostForm } from "../../components/PostForm";

export async function loader({ request }: Route.LoaderArgs) {
  const token = await requireToken(request);
  const categories = await categoriesQuery(token);
  return { categories };
}

export async function action({ request }: Route.ActionArgs) {
  const token = await requireToken(request);
  const formData = await request.formData();
  const input = await parsePostFormInput(token, formData);

  try {
    await createPostMutation(token, input);
    return redirect(paths.myPosts());
  } catch (error) {
    return toActionError(error, "Could not create the post.");
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
        cancelTo={paths.myPosts()}
        submitLabel="Publish"
      />
    </div>
  );
}
