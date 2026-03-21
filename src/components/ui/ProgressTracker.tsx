"use client";

import { useState, useEffect } from "react";
import type { GenerationState } from "@/lib/types";

const FUN_MESSAGES = [
  "Teaching AI to appreciate your aesthetic...",
  "Consulting the meme council...",
  "Your anime transformation is buffering...",
  "Calculating your main character score...",
  "Downloading your protagonist energy...",
  "Asking ChatGPT to hold your beer...",
  "Running vibes through the algorithm...",
  "Loading your character arc...",
  "Generating plot armor...",
  "Scanning your timeline for lore...",
];

interface ProgressTrackerProps {
  state: GenerationState;
}

export default function ProgressTracker({ state }: ProgressTrackerProps) {
  const { status, progress, error } = state;
  const [funIdx, setFunIdx] = useState(0);

  useEffect(() => {
    if (status === "idle" || status === "complete" || status === "error") return;
    const interval = setInterval(() => {
      setFunIdx((i) => (i + 1) % FUN_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [status]);

  if (status === "idle") return null;

  return (
    <div className="glass-card p-6 mt-6">
      {status === "error" ? (
        <div className="text-center">
          <div className="text-3xl mb-3">💀</div>
          <p className="text-neon-orange font-semibold mb-1">
            Something went wrong
          </p>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
      ) : status === "complete" ? (
        <div className="text-center">
          <div className="text-3xl mb-3">🎉</div>
          <p className="text-neon-green font-semibold">
            Your content is ready!
          </p>
          <p className="text-text-secondary text-sm mt-1">
            Redirecting to results...
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">{progress.step}</p>
            <span className="text-xs text-text-secondary">
              {progress.percent}%
            </span>
          </div>
          <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-neon-purple to-neon-pink rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary mt-3 text-center italic transition-opacity duration-300">
            {FUN_MESSAGES[funIdx]}
          </p>
          <div className="flex justify-center mt-3">
            <div className="w-5 h-5 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}
