import { redirect } from "react-router";

import type { Route } from "./+types/my-posts.$postId.destroy";
import { requireToken } from "../lib/auth.server";
import { removePostMutation } from "../lib/graphql/posts.server";

export async function action({ request, params }: Route.ActionArgs) {
  const token = await requireToken(request);
  await removePostMutation(token, params.postId);

  return redirect("/my-posts");
}
