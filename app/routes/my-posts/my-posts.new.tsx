import { useEffect } from 'react';
import { redirect, useNavigation } from 'react-router';
import { loadStripe } from '@stripe/stripe-js';

import type { Route } from './+types/my-posts.new';
import { requireTokenFromContext } from '../../lib/auth.server';
import { categoriesQuery } from '../../lib/graphql/categories.server';
import { createPostMutation, parsePostFormInput } from '../../lib/graphql/posts.server';
import { publishPostMutation } from '../../lib/graphql/payments.server';
import { toActionError } from '../../lib/graphql-client.server';
import { getStripePublishableKey } from '../../lib/stripe.server';
import { paths } from '../../lib/paths';
import { PostStatus } from '../../enums/post-status.enum';
import { PostForm } from '../../components/PostForm';

export async function loader({ context }: Route.LoaderArgs) {
  const token = requireTokenFromContext(context);
  const categories = await categoriesQuery(token);
  return { categories, stripePublishableKey: getStripePublishableKey() };
}

export async function action({ request, context }: Route.ActionArgs) {
  const token = requireTokenFromContext(context);
  const formData = await request.formData();
  const input = await parsePostFormInput(token, formData);
  const publishing = input.status === PostStatus.PUBLISHED;

  try {
    // A brand new post can never have been published before, so requesting PUBLISHED here always
    // needs payment — create it as a draft first, then run it through the same publishPost flow
    // the edit page and PostActionsBar use.
    const post = await createPostMutation(token, { ...input, status: publishing ? PostStatus.DRAFT : input.status });

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
  const { stripePublishableKey } = loaderData;
  const checkoutUrl = actionData && 'checkoutUrl' in actionData ? actionData.checkoutUrl : undefined;
  const error = actionData && 'error' in actionData ? actionData.error : undefined;

  useEffect(() => {
    if (!checkoutUrl) return;
    if (stripePublishableKey) {
      void loadStripe(stripePublishableKey);
    }
    window.location.href = checkoutUrl;
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
