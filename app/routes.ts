import {
  type RouteConfig,
  route,
  index,
  layout,
} from "@react-router/dev/routes";

export default [
  route("login", "routes/auth/login.tsx"),
  route("register", "routes/auth/register.tsx"),
  route("logout", "routes/auth/logout.tsx"),

  layout("routes/app-layout.tsx", [
    index("routes/posts/posts.tsx"),
    route(
      "posts/:postId/share-links",
      "routes/posts/posts.$postId.share-links.tsx",
    ),
    route("posts/:postId/:slug", "routes/posts/posts.$postId.$slug.tsx"),

    route("my-posts", "routes/my-posts/my-posts.tsx"),
    route("my-posts/new", "routes/my-posts/my-posts.new.tsx"),
    route("my-posts/:postId/edit", "routes/my-posts/my-posts.$postId.edit.tsx"),
    route(
      "my-posts/:postId/destroy",
      "routes/my-posts/my-posts.$postId.destroy.tsx",
    ),

    route("profile", "routes/profile/profile.tsx"),
    route("profile/edit", "routes/profile/profile.edit.tsx"),
  ]),
] satisfies RouteConfig;
