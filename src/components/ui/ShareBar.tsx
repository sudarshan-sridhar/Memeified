"use client";

import { useState, useCallback } from "react";
import { shareToTwitter, copyLink, downloadFile } from "@/lib/share";

interface ShareBarProps {
  mediaUrl: string;
  shareText: string;
  shareUrl: string;
  filename?: string;
}

export default function ShareBar({
  mediaUrl,
  shareText,
  shareUrl,
  filename = "mce-result",
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = useCallback(async () => {
    await copyLink(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const handleDownload = useCallback(() => {
    setDownloading(true);
    downloadFile(mediaUrl, filename);
    setTimeout(() => setDownloading(false), 1500);
  }, [mediaUrl, filename]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Main Character Energy",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or not supported
      }
    }
  }, [shareText, shareUrl]);

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => shareToTwitter(shareText, shareUrl)}
        className="share-btn hover:border-neon-cyan/50 hover:text-neon-cyan active:scale-95"
      >
        Share on 𝕏
      </button>
      <button
        onClick={handleCopy}
        className={`share-btn active:scale-95 ${
          copied
            ? "border-neon-green/50 text-neon-green"
            : "hover:border-neon-purple/50 hover:text-neon-purple"
        }`}
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
      <button
        onClick={handleDownload}
        className={`share-btn active:scale-95 ${
          downloading
            ? "border-neon-green/50 text-neon-green"
            : "hover:border-neon-green/50 hover:text-neon-green"
        }`}
      >
        {downloading ? "Saving..." : "Download"}
      </button>
      {hasNativeShare && (
        <button
          onClick={handleNativeShare}
          className="share-btn hover:border-neon-pink/50 hover:text-neon-pink active:scale-95"
        >
          Share...
        </button>
      )}
    </div>
  );
}
