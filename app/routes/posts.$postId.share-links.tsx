import { data } from "react-router";

import type { Route } from "./+types/posts.$postId.share-links";
import { requireToken } from "../lib/auth.server";
import { generateShareLinksQuery } from "../lib/graphql/open-graph.server";
import { GqlRequestError } from "../lib/graphql-client.server";

const SERVER_URL = process.env.HOST
  ? `https://${process.env.HOST}`
  : "http://localhost:3003";

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await requireToken(request);
  const slug = new URL(request.url).searchParams.get("slug");
  const url = slug ? `${SERVER_URL}/posts/${params.postId}/${slug}` : `${SERVER_URL}/posts/${params.postId}`;

  try {
    const shareLinks = await generateShareLinksQuery(token, url, params.postId);
    return { shareLinks };
  } catch (error) {
    const message =
      error instanceof GqlRequestError
        ? error.message
        : "Could not load share links.";
    return data({ error: message }, { status: 400 });
  }
}
