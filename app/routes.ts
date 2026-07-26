import {
  type RouteConfig,
  route,
  index,
  layout,
} from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("logout", "routes/logout.tsx"),

  layout("routes/app-layout.tsx", [
    index("routes/posts.tsx"),
    route("posts/:postId/share-links", "routes/posts.$postId.share-links.tsx"),
    route("posts/:postId/:slug", "routes/posts.$postId.$slug.tsx"),

    route("my-posts", "routes/my-posts.tsx"),
    route("my-posts/new", "routes/my-posts.new.tsx"),
    route("my-posts/:postId/edit", "routes/my-posts.$postId.edit.tsx"),
    route("my-posts/:postId/destroy", "routes/my-posts.$postId.destroy.tsx"),

    route("profile", "routes/profile.tsx"),
    route("profile/edit", "routes/profile.edit.tsx"),
  ]),
] satisfies RouteConfig;
