"use client";

import { useState, useCallback } from "react";
import { shareToTwitter, copyLink, downloadFile } from "@/lib/share";

interface ShareBarProps {
  mediaUrl: string;
  shareText: string;
  filename?: string;
}

export default function ShareBar({
  mediaUrl,
  shareText,
  filename = "mce-result",
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleTwitter = useCallback(() => {
    shareToTwitter(shareText, mediaUrl);
  }, [shareText, mediaUrl]);

  const handleCopyMedia = useCallback(async () => {
    await copyLink(mediaUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [mediaUrl]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    await downloadFile(mediaUrl, filename);
    setDownloading(false);
  }, [mediaUrl, filename]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handleTwitter}
        className="share-btn hover:border-neon-cyan/50 hover:text-neon-cyan active:scale-95"
      >
        Share on X
      </button>
      <button
        onClick={handleDownload}
        className={`share-btn active:scale-95 ${
          downloading
            ? "border-neon-pink/50 text-neon-pink"
            : "hover:border-neon-pink/50 hover:text-neon-pink"
        }`}
      >
        {downloading ? "Saving..." : "Save for IG"}
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
      <button
        onClick={handleCopyMedia}
        className={`share-btn active:scale-95 ${
          copied
            ? "border-neon-green/50 text-neon-green"
            : "hover:border-neon-purple/50 hover:text-neon-purple"
        }`}
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
