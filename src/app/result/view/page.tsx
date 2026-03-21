"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import ShareBar from "@/components/ui/ShareBar";
import SyncedVideoPlayer from "@/components/ui/SyncedVideoPlayer";
import Confetti from "@/components/ui/Confetti";
import { decodeOutputsFromUrl } from "@/lib/share";
import type {
  GenerationOutputs,
  MemeOutput,
  CreativeBriefs,
} from "@/lib/types";

function ResultContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold mb-4">
            No results found
          </h1>
          <Link href="/create" className="neon-button inline-block">
            Create Yours
          </Link>
        </div>
      </div>
    );
  }

  let decoded: {
    outputs: GenerationOutputs;
    profile: { handle: string; display_name: string; platform: string } | null;
    briefs: CreativeBriefs | null;
  };

  try {
    decoded = decodeOutputsFromUrl(data) as typeof decoded;
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold mb-4">
            Invalid result data
          </h1>
          <Link href="/create" className="neon-button inline-block">
            Create Yours
          </Link>
        </div>
      </div>
    );
  }

  const { outputs, profile, briefs } = decoded;
  const appUrl = typeof window !== "undefined" ? window.location.href : "";
  const handle = profile?.handle || "unknown";

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      <Confetti />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl md:text-5xl font-bold mb-3 neon-text">
            @{handle}&apos;s Results
          </h1>
          {profile && (
            <p className="text-text-secondary">
              {profile.display_name} on {profile.platform}
            </p>
          )}
        </div>

        {/* Anime Intro */}
        {outputs.anime && (
          <ResultSection
            title={
              briefs?.anime
                ? `${briefs.anime.archetype}: "${briefs.anime.tagline}"`
                : "Your Anime Intro"
            }
            icon="⚔️"
          >
            {outputs.anime.video_url && outputs.anime.voice_url ? (
              <SyncedVideoPlayer
                videoUrl={outputs.anime.video_url}
                audioUrl={outputs.anime.voice_url}
                posterUrl={outputs.anime.image_url}
                className="mb-4"
              />
            ) : outputs.anime.video_url ? (
              <video
                src={outputs.anime.video_url}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-full rounded-xl mb-4"
                poster={outputs.anime.image_url}
              />
            ) : outputs.anime.image_url ? (
              <img
                src={outputs.anime.image_url}
                alt="Anime portrait"
                className="w-full rounded-xl mb-4"
              />
            ) : null}
            <ShareBar
              mediaUrl={outputs.anime.video_url || outputs.anime.image_url || ""}
              shareText={`AI turned me into "${briefs?.anime?.archetype || "an anime character"}" ⚔️ -- made with @magichourai`}
              shareUrl={appUrl}
              filename={`mce-anime-${handle}`}
            />
          </ResultSection>
        )}

        {/* Fake Trailer */}
        {outputs.trailer && (
          <ResultSection
            title={
              briefs?.trailer
                ? `${briefs.trailer.movie_title}: "${briefs.trailer.tagline}"`
                : "Your Fake Trailer"
            }
            icon="🎬"
          >
            {outputs.trailer.video_url && outputs.trailer.voice_url ? (
              <SyncedVideoPlayer
                videoUrl={outputs.trailer.video_url}
                audioUrl={outputs.trailer.voice_url}
                posterUrl={outputs.trailer.image_url}
                className="mb-4"
              />
            ) : outputs.trailer.video_url ? (
              <video
                src={outputs.trailer.video_url}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-full rounded-xl mb-4"
                poster={outputs.trailer.image_url}
              />
            ) : outputs.trailer.image_url ? (
              <img
                src={outputs.trailer.image_url}
                alt="Trailer poster"
                className="w-full rounded-xl mb-4"
              />
            ) : null}
            <ShareBar
              mediaUrl={outputs.trailer.video_url || outputs.trailer.image_url || ""}
              shareText={`My AI movie trailer: "${briefs?.trailer?.movie_title || "UNTITLED"}" 🎬 -- made with @magichourai`}
              shareUrl={appUrl}
              filename={`mce-trailer-${handle}`}
            />
          </ResultSection>
        )}

        {/* Roast Video */}
        {outputs.roast && (
          <ResultSection title="Your Roast" icon="🔥">
            {outputs.roast.video_url && outputs.roast.voice_url ? (
              <SyncedVideoPlayer
                videoUrl={outputs.roast.video_url}
                audioUrl={outputs.roast.voice_url}
                posterUrl={outputs.roast.image_url}
                className="mb-4"
              />
            ) : outputs.roast.video_url ? (
              <video
                src={outputs.roast.video_url}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-full rounded-xl mb-4"
                poster={outputs.roast.image_url}
              />
            ) : outputs.roast.image_url ? (
              <img
                src={outputs.roast.image_url}
                alt="Roast card"
                className="w-full rounded-xl mb-4"
              />
            ) : null}
            <ShareBar
              mediaUrl={outputs.roast.video_url || outputs.roast.image_url || ""}
              shareText={`AI roasted my profile 💀🔥 -- made with @magichourai`}
              shareUrl={appUrl}
              filename={`mce-roast-${handle}`}
            />
          </ResultSection>
        )}

        {/* Meme Pack */}
        {outputs.memes && outputs.memes.length > 0 && (
          <ResultSection title="Your Meme Pack" icon="😂">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {outputs.memes.map((meme: MemeOutput, i: number) => (
                <div key={i} className="glass-card p-3">
                  <img
                    src={meme.image_url}
                    alt={`Meme: ${meme.topic}`}
                    className="w-full rounded-lg mb-3"
                  />
                  <p className="text-xs text-text-secondary mb-3 line-clamp-2">
                    {meme.topic}
                  </p>
                  <ShareBar
                    mediaUrl={meme.image_url}
                    shareText={`AI made this meme about me 😂 -- made with @magichourai`}
                    shareUrl={appUrl}
                    filename={`mce-meme-${handle}-${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </ResultSection>
        )}

        {/* CTA */}
        <div className="text-center mt-12 space-y-6">
          <p className="text-text-secondary text-sm">
            Made with Main Character Energy
          </p>
          <Link href="/create" className="neon-button text-lg inline-block">
            Make Yours
          </Link>
          <p className="text-text-secondary text-xs">
            Powered by{" "}
            <a
              href="https://magichour.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-purple hover:underline font-semibold"
            >
              Magic Hour
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function ResultSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card p-5 sm:p-6 md:p-8 mb-6">
      <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl sm:text-2xl font-bold mb-5 flex items-center gap-3">
        <span className="text-2xl sm:text-3xl">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
