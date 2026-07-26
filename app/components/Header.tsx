import { Form, Link, useLocation } from "react-router";

import { Icons } from "./Icons";
import { avatarUrl } from "../lib/images";
import type { UserEntity } from "../lib/types";

export function Header({ user }: { user?: UserEntity }) {
  const location = useLocation();
  const isMyPosts = location.pathname.startsWith("/my-posts");
  const isPosts = location.pathname === "/";
  const loginHref = `/login?from=${encodeURIComponent(location.pathname + location.search)}`;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-100 transition-transform group-hover:scale-105">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              PostShare
            </span>
          </Link>

          <nav className="hidden sm:flex space-x-1 sm:space-x-2">
            <Link
              to="/"
              className={`flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isPosts
                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                  : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              <Icons.Post />
              <span className="ml-2">Posts</span>
            </Link>
            {user && (
              <Link
                to="/my-posts"
                className={`flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isMyPosts
                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                }`}
              >
                <Icons.MyPosts />
                <span className="ml-2">My Posts</span>
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {user ? (
              <>
                <Link
                  to="/my-posts/new"
                  className="hidden md:flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-100 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                >
                  <Icons.Plus />
                  Create Post
                </Link>

                <div className="flex items-center space-x-2 pl-2 sm:pl-3 border-l border-slate-200">
                  <Link
                    to="/profile"
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

                  <Form method="post" action="/logout">
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
              <Link
                to={loginHref}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-100 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        <nav className="flex sm:hidden space-x-1 pb-3">
          <Link
            to="/"
            className={`flex items-center px-3 py-1.5 text-sm font-semibold rounded-xl transition-all ${
              isPosts
                ? "bg-blue-50 text-blue-700 border border-blue-100"
                : "text-slate-600"
            }`}
          >
            <Icons.Post />
            <span className="ml-2">Posts</span>
          </Link>

          {user && (
            <Link
              to="/my-posts"
              className={`flex items-center px-3 py-1.5 text-sm font-semibold rounded-xl transition-all ${
                isMyPosts
                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                  : "text-slate-600"
              }`}
            >
              <Icons.MyPosts />
              <span className="ml-2">My Posts</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
