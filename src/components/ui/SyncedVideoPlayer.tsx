"use client";

import { useRef, useCallback, useEffect } from "react";

interface SyncedVideoPlayerProps {
  videoUrl: string;
  audioUrl: string;
  posterUrl?: string;
  className?: string;
}

export default function SyncedVideoPlayer({
  videoUrl,
  audioUrl,
  posterUrl,
  className = "",
}: SyncedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const syncAudioToVideo = useCallback(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    // Keep audio time in sync with video
    const drift = Math.abs(video.currentTime - audio.currentTime);
    if (drift > 0.15) {
      audio.currentTime = video.currentTime;
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    const handlePlay = () => {
      audio.currentTime = video.currentTime;
      audio.play().catch(() => {});
    };

    const handlePause = () => {
      audio.pause();
    };

    const handleSeeked = () => {
      audio.currentTime = video.currentTime;
    };

    const handleEnded = () => {
      audio.pause();
      audio.currentTime = 0;
    };

    const handleTimeUpdate = () => {
      syncAudioToVideo();
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("timeupdate", handleTimeUpdate);

    // Mute the video's own audio track (it has none, but just in case)
    video.muted = false;

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [syncAudioToVideo]);

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        controls
        className="w-full rounded-xl"
        playsInline
      />
      <audio ref={audioRef} src={audioUrl} preload="auto" />
    </div>
  );
}
