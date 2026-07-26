import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { SocialPlatform } from "../enums/social-platform.enum";

import { Icons } from "./Icons";
import type { ShareLinks } from "../lib/types";

interface ShareModalProps {
  postId: string;
  postSlug: string;
  postTitle: string;
  open: boolean;
  onClose: () => void;
}

type ShareLinksResponse = { shareLinks: ShareLinks } | { error: string };

export function ShareModal({
  postId,
  postSlug,
  postTitle,
  open,
  onClose,
}: ShareModalProps) {
  const fetcher = useFetcher<ShareLinksResponse>();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (open && fetcher.state === "idle" && !fetcher.data) {
      fetcher.load(
        `/posts/${postId}/share-links?slug=${encodeURIComponent(postSlug)}`,
      );
    }
    // fetcher identity changes every render by design; only re-run on open/postId change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, postId, postSlug]);

  if (!open) {
    return null;
  }

  const shareLinks =
    fetcher.data && "shareLinks" in fetcher.data
      ? fetcher.data.shareLinks
      : undefined;
  const errorMsg =
    fetcher.data && "error" in fetcher.data ? fetcher.data.error : undefined;

  const copy = async (url: string, key: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(
      () => setCopiedKey((current) => (current === key ? null : current)),
      1500,
    );
  };

  const platforms = shareLinks
    ? [
        {
          key: SocialPlatform.Facebook,
          label: "Facebook",
          url: shareLinks.facebook,
          Icon: Icons.Facebook,
        },
        {
          key: SocialPlatform.Twitter,
          label: "Twitter / X",
          url: shareLinks.twitter,
          Icon: Icons.Twitter,
        },
        {
          key: SocialPlatform.LinkedIn,
          label: "LinkedIn",
          url: shareLinks.linkedin,
          Icon: Icons.LinkedIn,
        },
        {
          key: SocialPlatform.Telegram,
          label: "Telegram",
          url: shareLinks.telegram,
          Icon: Icons.Telegram,
        },
        {
          key: SocialPlatform.Whatsapp,
          label: "Whatsapp",
          url: shareLinks.whatsapp,
          Icon: Icons.Whatsapp,
        },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-sm"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          title="Close"
        >
          <Icons.Close />
        </button>

        <h3 className="text-lg font-black text-slate-900">Share This Post</h3>
        <p className="text-xs text-slate-400 mt-0.5 truncate">
          &quot;{postTitle}&quot;
        </p>

        <div className="mt-5 space-y-3">
          {fetcher.state !== "idle" && !shareLinks && !errorMsg && (
            <p className="text-sm text-slate-400">Loading share links…</p>
          )}
          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

          {platforms.map(({ key, label, url, Icon }) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icon />
                <span className="text-sm font-bold text-slate-800">
                  {label}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Share Link
                </a>
                <button
                  type="button"
                  onClick={() => copy(url, key)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all flex items-center"
                  title="Copy link"
                >
                  <Icons.Copy />
                  {copiedKey === key && (
                    <span className="text-[10px] font-bold text-blue-600 ml-0.5">
                      Copied
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
