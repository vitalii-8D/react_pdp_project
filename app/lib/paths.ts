export const paths = {
  posts: () => "/",
  postDetail: (id: string, slug: string) => `/posts/${id}/${slug}`,
  postShareLinks: (id: string, slug: string) =>
    `/posts/${id}/share-links?slug=${encodeURIComponent(slug)}`,
  myPosts: () => "/my-posts",
  myPostsNew: () => "/my-posts/new",
  myPostEdit: (id: string) => `/my-posts/${id}/edit`,
  myPostDestroy: (id: string) => `/my-posts/${id}/destroy`,
  profile: () => "/profile",
  profileEdit: () => "/profile/edit",
  login: (from?: string) =>
    from ? `/login?from=${encodeURIComponent(from)}` : "/login",
  logout: () => "/logout",
  register: (from?: string) =>
    from ? `/register?from=${encodeURIComponent(from)}` : "/register",
} as const;
