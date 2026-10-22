import type { Route } from './+types/posts.$postId.view';
import { incrementPostViewCountMutation } from '../../lib/graphql/posts.server';

// Counts one view per post visit - posted once from the post page (see posts.$postId.$slug.tsx)
// instead of from its loader, which re-runs on every revalidation (e.g. after each comment action)
// and would count those as extra views.
export async function action({ params }: Route.ActionArgs) {
  try {
    await incrementPostViewCountMutation(params.postId);
  } catch {
    // View count is a soft engagement signal - not worth surfacing a failure for.
  }

  return { ok: true };
}
