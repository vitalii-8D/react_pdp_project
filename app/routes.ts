import { type RouteConfig, route, index, layout } from '@react-router/dev/routes';

export default [
  route('login', 'routes/auth/login.tsx'),
  route('register', 'routes/auth/register.tsx'),
  route('logout', 'routes/auth/logout.tsx'),

  layout('routes/app-layout.tsx', [
    index('routes/posts/posts.tsx'),
    route('posts/:postId/share-links', 'routes/posts/posts.$postId.share-links.tsx'),
    route('posts/:postId/comments', 'routes/posts/posts.$postId.comments.tsx'),
    route('posts/:postId/comments/:commentId', 'routes/posts/posts.$postId.comments.$commentId.tsx'),
    route('posts/:postId/comments/:commentId/destroy', 'routes/posts/posts.$postId.comments.$commentId.destroy.tsx'),
    route('posts/:postId/:slug', 'routes/posts/posts.$postId.$slug.tsx'),

    route('my-posts', 'routes/my-posts/my-posts.tsx'),
    route('my-posts/new', 'routes/my-posts/my-posts.new.tsx'),
    route('my-posts/:postId/edit', 'routes/my-posts/my-posts.$postId.edit.tsx'),
    route('my-posts/:postId/destroy', 'routes/my-posts/my-posts.$postId.destroy.tsx'),
    route('my-posts/:postId/publish', 'routes/my-posts/my-posts.$postId.publish.tsx'),
    route('my-posts/:postId/retry-payment', 'routes/my-posts/my-posts.$postId.retry-payment.tsx'),

    route('payments/success', 'routes/payments/payments.success.tsx'),
    route('payments/cancel', 'routes/payments/payments.cancel.tsx'),

    route('users', 'routes/users/users.tsx'),
    route('analytics', 'routes/analytics/analytics.tsx'),

    route('profile', 'routes/profile/profile.tsx'),
    route('profile/edit', 'routes/profile/profile.edit.tsx'),
    route('profile/geocode', 'routes/profile/profile.geocode.tsx'),
    route(
      'profile/transactions/:transactionId/refund',
      'routes/profile/profile.transactions.$transactionId.refund.tsx',
    ),

    route('uploads/presign', 'routes/uploads/uploads.presign.tsx'),

    route('chat', 'routes/chat/chat.tsx'),
    route('chat/users/search', 'routes/chat/chat.users-search.tsx'),
    route('chat/dm', 'routes/chat/chat.start-dm.tsx'),
    route('chat/:roomId', 'routes/chat/chat.$roomId.tsx'),
  ]),
] satisfies RouteConfig;
