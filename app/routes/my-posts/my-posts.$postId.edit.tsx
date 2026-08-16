import { useEffect } from 'react';
import { redirect, useNavigation } from 'react-router';
import { loadStripe } from '@stripe/stripe-js';

import type { Route } from './+types/my-posts.$postId.edit';
import { requireUser, requireToken } from '../../lib/auth.server';
import { categoriesQuery } from '../../lib/graphql/categories.server';
import { postQuery, updatePostMutation, parsePostFormInput } from '../../lib/graphql/posts.server';
import { publishPostMutation } from '../../lib/graphql/payments.server';
import { toActionError } from '../../lib/graphql-client.server';
import { getStripePublishableKey } from '../../lib/stripe.server';
import { paths } from '../../lib/paths';
import { PostStatus } from '../../enums/post-status.enum';
import { PostForm } from '../../components/PostForm';

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token, user } = await requireUser(request);
  const [post, categories] = await Promise.all([postQuery(token, params.postId), categoriesQuery(token)]);

  if (post.author.id !== user.id) {
    throw redirect(paths.myPosts());
  }

  return { post, categories, stripePublishableKey: getStripePublishableKey() };
}

export async function action({ request, params }: Route.ActionArgs) {
  const token = await requireToken(request);
  const formData = await request.formData();
  const input = await parsePostFormInput(token, formData);
  const publishing = input.status === PostStatus.PUBLISHED;

  try {
    // updatePost rejects status: PUBLISHED outright unless the post has already been published
    // once — moving to PUBLISHED (first time or free re-publish) is exclusively publishPost's job.
    await updatePostMutation(token, { id: params.postId, ...input, status: publishing ? undefined : input.status });

    if (publishing) {
      const result = await publishPostMutation(token, params.postId);
      if (result.checkoutUrl) {
        return { checkoutUrl: result.checkoutUrl };
      }
    }

    return redirect(paths.myPosts());
  } catch (error) {
    return toActionError(error, 'Could not update the post.');
  }
}

export default function EditPost({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const { post, categories, stripePublishableKey } = loaderData;
  const checkoutUrl = actionData && 'checkoutUrl' in actionData ? actionData.checkoutUrl : undefined;
  const error = actionData && 'error' in actionData ? actionData.error : undefined;

  useEffect(() => {
    if (!checkoutUrl) return;
    // Stripe still recommends loading Stripe.js on any page that completes a payment (it
    // initializes their fraud-detection scripts) even though the redirect itself is a plain
    // navigation — see PostActionsBar's identical publish flow.
    if (stripePublishableKey) {
      void loadStripe(stripePublishableKey);
    }
    window.location.href = checkoutUrl;
  }, [checkoutUrl, stripePublishableKey]);

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
          status: post.status,
          categoryIds: post.categories?.map((category) => category.id) ?? [],
          image: post.postImage
            ? {
                key: post.postImage.key,
                url: post.postImage.url,
                mimeType: post.postImage.mimeType,
                sizeBytes: post.postImage.sizeBytes,
                originalFileName: post.postImage.originalFileName,
                altText: post.postImage.altText ?? undefined,
              }
            : undefined,
        }}
        error={error}
        pending={navigation.state === 'submitting'}
        cancelTo={paths.myPosts()}
        submitLabel="Save Changes"
      />
    </div>
  );
}
