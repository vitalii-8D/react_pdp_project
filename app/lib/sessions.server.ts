import { createCookieSessionStorage } from "react-router";

export const SESSION_TOKEN_KEY = "token";

interface SessionData {
  [SESSION_TOKEN_KEY]: string;
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secrets: [process.env.SESSION_SECRET || "dev-secret-change-me"],
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 60,
    },
  });

export { getSession, commitSession, destroySession };
