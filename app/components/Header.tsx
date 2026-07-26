import { Form, Link, useLocation } from "react-router";

import { Icons } from "./Icons";
import { LogoMark } from "./LogoMark";
import { NavLink } from "./NavLink";
import { buttonStyles } from "./Button";
import { avatarUrl } from "../lib/images";
import { paths } from "../lib/paths";
import type { UserEntity } from "../lib/types";

export function Header({ user }: { user?: UserEntity }) {
  const location = useLocation();
  const isMyPosts = location.pathname.startsWith(paths.myPosts());
  const isPosts = location.pathname === paths.posts();
  const loginHref = paths.login(location.pathname + location.search);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link
            to={paths.posts()}
            className="flex items-center space-x-3 group"
          >
            <LogoMark className="transition-transform group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              PostShare
            </span>
          </Link>

          <nav className="hidden sm:flex space-x-1 sm:space-x-2">
            <NavLink to={paths.posts()} isActive={isPosts}>
              <Icons.Post />
              <span className="ml-2">Posts</span>
            </NavLink>
            {user && (
              <NavLink to={paths.myPosts()} isActive={isMyPosts}>
                <Icons.MyPosts />
                <span className="ml-2">My Posts</span>
              </NavLink>
            )}
          </nav>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {user ? (
              <>
                <Link
                  to={paths.myPostsNew()}
                  className={buttonStyles({
                    className: "hidden md:flex",
                  })}
                >
                  <Icons.Plus />
                  Create Post
                </Link>

                <div className="flex items-center space-x-2 pl-2 sm:pl-3 border-l border-slate-200">
                  <Link
                    to={paths.profile()}
                    title="View profile"
                    className="flex items-center space-x-2 focus:outline-none group focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                  >
                    <img
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-500 transition-all duration-200"
                      src={avatarUrl(user.id)}
                      alt={user.name}
                    />
                    <span className="hidden lg:block text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {user.name}
                    </span>
                  </Link>

                  <Form method="post" action={paths.logout()}>
                    <button
                      type="submit"
                      title="Log out"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Icons.Logout />
                    </button>
                  </Form>
                </div>
              </>
            ) : (
              <Link to={loginHref} className={buttonStyles()}>
                Sign in
              </Link>
            )}
          </div>
        </div>

        <nav className="flex sm:hidden space-x-1 pb-3">
          <NavLink to={paths.posts()} isActive={isPosts} size="sm">
            <Icons.Post />
            <span className="ml-2">Posts</span>
          </NavLink>

          {user && (
            <NavLink to={paths.myPosts()} isActive={isMyPosts} size="sm">
              <Icons.MyPosts />
              <span className="ml-2">My Posts</span>
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
