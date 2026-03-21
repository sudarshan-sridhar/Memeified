"use client";

interface PlatformToggleProps {
  value: "twitter" | "instagram";
  onChange: (platform: "twitter" | "instagram") => void;
  disabled?: boolean;
}

export default function PlatformToggle({
  value,
  onChange,
  disabled,
}: PlatformToggleProps) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-neon-purple/30 bg-bg-secondary">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("twitter")}
        className={`flex-1 px-6 py-3 font-semibold text-sm transition-all ${
          value === "twitter"
            ? "bg-neon-purple text-white"
            : "text-text-secondary hover:text-text-primary"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        𝕏 Twitter
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("instagram")}
        className={`flex-1 px-6 py-3 font-semibold text-sm transition-all ${
          value === "instagram"
            ? "bg-neon-pink text-white"
            : "text-text-secondary hover:text-text-primary"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        📷 Instagram
      </button>
    </div>
  );
}
