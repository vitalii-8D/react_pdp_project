import { useEffect } from 'react';
import { redirect, useNavigation } from 'react-router';

import type { Route } from './+types/my-posts.$postId.edit';
import { requireUserFromContext, requireTokenFromContext } from '../../lib/auth.server';
import { categoriesQuery } from '../../lib/graphql/categories.server';
import { postQuery, updatePostMutation } from '../../lib/graphql/posts.server';
import { parsePostFormInput } from '../../lib/post-form';
import { publishPostMutation } from '../../lib/graphql/payments.server';
import { toActionError } from '../../lib/graphql-client.server';
import { paths } from '../../lib/paths';
import { redirectToCheckout } from '../../lib/checkout';
import { useStripePublishableKey } from '../../hooks/useStripePublishableKey';
import { PostStatus } from '../../enums/post-status.enum';
import { PostForm } from '../../components/PostForm';

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const { token, user } = await requireUserFromContext(request, context);
  const [post, categories] = await Promise.all([postQuery(token, params.postId), categoriesQuery(token)]);

  if (post.author.id !== user.id) {
    throw redirect(paths.myPosts());
  }

  return { post, categories };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const token = requireTokenFromContext(context);
  const formData = await request.formData();
  try {
    // The tag names come from the category list, so it is fetched here just like the form's loader does.
    const input = parsePostFormInput(formData, await categoriesQuery(token));
    const publishing = input.status === PostStatus.Published;

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
  const { post, categories } = loaderData;
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
