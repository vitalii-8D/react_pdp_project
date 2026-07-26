// Guards against open-redirect: only allow relative, same-origin paths.
export function safeRedirectPath(
  to: string | null | undefined,
  fallback = "/",
): string {
  if (!to || !to.startsWith("/") || to.startsWith("//")) {
    return fallback;
  }
  return to;
}
