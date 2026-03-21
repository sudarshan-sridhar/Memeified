"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PlatformToggle from "@/components/ui/PlatformToggle";
import HandleInput from "@/components/ui/HandleInput";
import FeatureSelector from "@/components/ui/FeatureSelector";
import ProgressTracker from "@/components/ui/ProgressTracker";
import { useGeneration } from "@/hooks/useGeneration";
import type { FeatureConfig } from "@/lib/types";
import { encodeOutputsForUrl } from "@/lib/share";

export default function CreatePage() {
  const router = useRouter();
  const { state, startGeneration, reset } = useGeneration();

  const [platform, setPlatform] = useState<"twitter" | "instagram">("twitter");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [vibes, setVibes] = useState("");
  const [features, setFeatures] = useState<FeatureConfig>({
    anime: false,
    trailer: { enabled: false, genre: "Marvel" },
    roast: false,
    memes: true,
    videoDuration: 5,
  });

  const isGenerating =
    state.status !== "idle" &&
    state.status !== "complete" &&
    state.status !== "error";
  const hasSelectedFeature =
    features.anime ||
    features.trailer.enabled ||
    features.roast ||
    features.memes;

  const handleGenerate = async () => {
    if (!handle.trim() || !hasSelectedFeature) return;
    await startGeneration(platform, handle.trim(), features, {
      bio: bio.trim(),
      vibes: vibes.trim(),
    });
  };

  // Navigate to results when generation is complete
  if (state.status === "complete" && Object.keys(state.outputs).length > 0) {
    const encoded = encodeOutputsForUrl({
      outputs: state.outputs,
      profile: state.profile
        ? {
            handle: state.profile.handle,
            display_name: state.profile.display_name,
            platform: state.profile.platform,
          }
        : null,
      briefs: state.briefs,
    });
    setTimeout(() => {
      router.push(`/result/view?data=${encodeURIComponent(encoded)}`);
    }, 1500);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="text-text-secondary text-sm hover:text-text-primary transition-colors mb-8 inline-block"
        >
          &larr; Back
        </Link>

        <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold text-center mb-2 neon-text">
          Drop Your Handle
        </h1>
        <p className="text-text-secondary text-center mb-8">
          We&apos;ll scrape your public profile and turn it into content
        </p>

        <div className="space-y-6">
          {/* Platform Toggle */}
          <PlatformToggle
            value={platform}
            onChange={setPlatform}
            disabled={isGenerating}
          />

          {/* Handle Input */}
          <HandleInput
            value={handle}
            onChange={setHandle}
            disabled={isGenerating}
          />

          {/* Optional extra context (collapsible) */}
          <details className="group">
            <summary className="text-sm text-text-secondary font-semibold uppercase tracking-wide cursor-pointer select-none flex items-center gap-2 hover:text-text-primary transition-colors">
              <span className="text-neon-purple group-open:rotate-90 transition-transform">&#9654;</span>
              Add more context
              <span className="normal-case font-normal text-xs opacity-60">
                (optional — helps AI make better content)
              </span>
            </summary>
            <div className="space-y-3 mt-3">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Your bio, what you do, what you're about..."
                disabled={isGenerating}
                rows={2}
                className="handle-input pl-5 text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <textarea
                value={vibes}
                onChange={(e) => setVibes(e.target.value)}
                placeholder="Hot takes, interests, anything you want the AI to roast or hype..."
                disabled={isGenerating}
                rows={2}
                className="handle-input pl-5 text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </details>

          {/* Feature Selector */}
          <FeatureSelector
            features={features}
            onChange={setFeatures}
            disabled={isGenerating}
          />

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !handle.trim() || !hasSelectedFeature}
            className="neon-button hover-scale w-full text-center text-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>

          {/* Progress Tracker */}
          <ProgressTracker state={state} />

          {/* Error retry */}
          {state.status === "error" && (
            <button
              onClick={reset}
              className="w-full py-3 text-center text-sm text-text-secondary hover:text-text-primary border border-white/10 rounded-xl transition-colors"
            >
              Try Again
            </button>
          )}
        </div>

        <p className="mt-8 text-center text-text-secondary text-xs">
          Powered by{" "}
          <a
            href="https://magichour.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-purple hover:underline"
          >
            Magic Hour
          </a>
        </p>
      </div>
    </div>
  );
}
