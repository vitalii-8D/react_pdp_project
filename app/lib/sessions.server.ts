import { createCookieSessionStorage } from "react-router";

interface SessionData {
  token: string;
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
      maxAge: 60 * 60 * 24 * 60, // 60 days, mirrors BE's default JWT_EXPIRE
    },
  });

export { getSession, commitSession, destroySession };
