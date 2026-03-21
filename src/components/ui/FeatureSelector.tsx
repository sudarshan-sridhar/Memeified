"use client";

import type { FeatureConfig, TrailerGenre } from "@/lib/types";
import { TRAILER_GENRES } from "@/lib/types";

interface FeatureSelectorProps {
  features: FeatureConfig;
  onChange: (features: FeatureConfig) => void;
  disabled?: boolean;
}

const FEATURE_INFO = [
  {
    key: "memes" as const,
    label: "Meme Pack",
    desc: "3 personalized memes",
    icon: "😂",
    cost: "~30 credits",
  },
  {
    key: "anime" as const,
    label: "Anime Intro",
    desc: "Portrait + voiceover + video",
    icon: "⚔️",
    cost: "~463 credits",
  },
  {
    key: "roast" as const,
    label: "Roast Video",
    desc: "Roast card + voice + video",
    icon: "🔥",
    cost: "~463 credits",
  },
  {
    key: "trailer" as const,
    label: "Fake Trailer",
    desc: "Poster + narration + video",
    icon: "🎬",
    cost: "~463 credits",
  },
];

export default function FeatureSelector({
  features,
  onChange,
  disabled,
}: FeatureSelectorProps) {
  const toggle = (key: string) => {
    if (key === "trailer") {
      onChange({
        ...features,
        trailer: {
          ...features.trailer,
          enabled: !features.trailer.enabled,
        },
      });
    } else {
      onChange({
        ...features,
        [key]: !features[key as keyof FeatureConfig],
      });
    }
  };

  const isEnabled = (key: string) => {
    if (key === "trailer") return features.trailer.enabled;
    return features[key as keyof FeatureConfig] as boolean;
  };

  return (
    <div className="space-y-3">
      <label className="text-sm text-text-secondary font-semibold uppercase tracking-wide">
        Select Features
      </label>
      <div className="grid grid-cols-2 gap-3">
        {FEATURE_INFO.map((f) => (
          <button
            key={f.key}
            type="button"
            disabled={disabled}
            onClick={() => toggle(f.key)}
            className={`glass-card p-4 text-left transition-all ${
              isEnabled(f.key)
                ? "border-neon-purple/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                : "opacity-60"
            } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{f.icon}</span>
              <span className="font-semibold text-sm">{f.label}</span>
            </div>
            <p className="text-xs text-text-secondary">{f.desc}</p>
            <p className="text-xs text-neon-purple mt-1">{f.cost}</p>
          </button>
        ))}
      </div>

      {/* Trailer genre picker */}
      {features.trailer.enabled && (
        <div className="mt-3">
          <label className="text-sm text-text-secondary mb-2 block">
            Trailer Genre
          </label>
          <div className="flex flex-wrap gap-2">
            {TRAILER_GENRES.map((genre) => (
              <button
                key={genre}
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange({
                    ...features,
                    trailer: { ...features.trailer, genre: genre as TrailerGenre },
                  })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  features.trailer.genre === genre
                    ? "bg-neon-purple text-white"
                    : "bg-bg-tertiary text-text-secondary hover:text-text-primary border border-white/10"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video duration toggle — only show if a video feature is selected */}
      {(features.anime || features.roast || features.trailer.enabled) && (
        <div className="mt-3">
          <label className="text-sm text-text-secondary mb-2 block">
            Video Length
          </label>
          <div className="flex gap-2">
            {([5, 10] as const).map((dur) => (
              <button
                key={dur}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ ...features, videoDuration: dur })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  features.videoDuration === dur
                    ? "bg-neon-purple text-white"
                    : "bg-bg-tertiary text-text-secondary hover:text-text-primary border border-white/10"
                }`}
              >
                {dur}s {dur === 5 ? "(faster)" : "(better)"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
