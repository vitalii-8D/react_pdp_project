import { useEffect } from 'react';
import { redirect, useNavigation } from 'react-router';

import type { Route } from './+types/my-posts.new';
import { requireTokenFromContext } from '../../lib/auth.server';
import { categoriesQuery } from '../../lib/graphql/categories.server';
import { createPostMutation } from '../../lib/graphql/posts.server';
import { parsePostFormInput } from '../../lib/post-form';
import { publishPostMutation } from '../../lib/graphql/payments.server';
import { toActionError } from '../../lib/graphql-client.server';
import { paths } from '../../lib/paths';
import { redirectToCheckout } from '../../lib/checkout';
import { useStripePublishableKey } from '../../hooks/useStripePublishableKey';
import { PostStatus } from '../../enums/post-status.enum';
import { PostForm } from '../../components/PostForm';

export async function loader({ context }: Route.LoaderArgs) {
  const token = requireTokenFromContext(context);
  const categories = await categoriesQuery(token);

  return { categories };
}

export async function action({ request, context }: Route.ActionArgs) {
  const token = requireTokenFromContext(context);
  const formData = await request.formData();
  try {
    // The tag names come from the category list, so it is fetched here just like the form's loader does.
    const input = parsePostFormInput(formData, await categoriesQuery(token));
    const publishing = input.status === PostStatus.Published;

    // A brand new post can never have been published before, so requesting PUBLISHED here always
    // needs payment — create it as a draft first, then run it through the same publishPost flow
    // the edit page and PostActionsBar use.
    const post = await createPostMutation(token, { ...input, status: publishing ? PostStatus.Draft : input.status });

    if (publishing) {
      const result = await publishPostMutation(token, post.id);
      if (result.checkoutUrl) {
        return { checkoutUrl: result.checkoutUrl };
      }
    }

    return redirect(paths.myPosts());
  } catch (error) {
    return toActionError(error, 'Could not create the post.');
  }
}

export default function NewPost({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const stripePublishableKey = useStripePublishableKey();
  const checkoutUrl = actionData && 'checkoutUrl' in actionData ? actionData.checkoutUrl : undefined;
  const error = actionData && 'error' in actionData ? actionData.error : undefined;

  // A paid publish comes back with a Checkout URL - a full browser navigation to Stripe's hosted page.
  useEffect(() => {
    if (!checkoutUrl) {
      return;
    }
    void redirectToCheckout(checkoutUrl, stripePublishableKey);
  }, [checkoutUrl, stripePublishableKey]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Create Post</h1>
        <p className="text-slate-500 mt-1">Share something new with the community.</p>
      </div>

      <PostForm
        categories={loaderData.categories}
        error={error}
        pending={navigation.state === 'submitting'}
        cancelTo={paths.myPosts()}
        submitLabel="Save Changes"
      />
    </div>
  );
}
