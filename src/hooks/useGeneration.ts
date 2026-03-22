"use client";

import { useReducer, useCallback } from "react";
import type {
  GenerationState,
  GenerationStatus,
  FeatureConfig,
  ProfileData,
  CreativeBriefs,
  GenerationOutputs,
  MemeOutput,
} from "@/lib/types";

// === Actions ===

type Action =
  | { type: "SET_STATUS"; status: GenerationStatus; step: string; percent: number }
  | { type: "SET_PROFILE"; profile: ProfileData }
  | { type: "SET_BRIEFS"; briefs: CreativeBriefs }
  | { type: "ADD_JOBS"; feature: string; jobIds: string[] }
  | { type: "SET_OUTPUTS"; outputs: Partial<GenerationOutputs> }
  | { type: "SET_ERROR"; error: string }
  | { type: "RESET" };

const initialState: GenerationState = {
  status: "idle",
  progress: { step: "", percent: 0 },
  jobs: {},
  outputs: {},
};

function reducer(state: GenerationState, action: Action): GenerationState {
  switch (action.type) {
    case "SET_STATUS":
      return {
        ...state,
        status: action.status,
        progress: { step: action.step, percent: action.percent },
      };
    case "SET_PROFILE":
      return { ...state, profile: action.profile };
    case "SET_BRIEFS":
      return { ...state, briefs: action.briefs };
    case "ADD_JOBS":
      return {
        ...state,
        jobs: { ...state.jobs, [action.feature]: action.jobIds },
      };
    case "SET_OUTPUTS":
      return {
        ...state,
        outputs: { ...state.outputs, ...action.outputs },
      };
    case "SET_ERROR":
      return { ...state, status: "error", error: action.error };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// === Helpers ===

/** Trim voice script to fit within the chosen video duration. ~13 chars/sec. */
function trimScriptForDuration(script: string, durationSec: number): string {
  const maxChars = (durationSec - 1) * 13; // 1s buffer
  if (script.length <= maxChars) return script;
  // Cut at last sentence boundary within limit
  const trimmed = script.slice(0, maxChars);
  const lastPeriod = trimmed.lastIndexOf(".");
  return lastPeriod > maxChars * 0.5 ? trimmed.slice(0, lastPeriod + 1) : trimmed;
}

// === API Helpers ===

async function apiCall<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: T;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`${url} returned invalid JSON (${res.status}): ${text.slice(0, 100)}`);
  }
  if (!res.ok) throw new Error((data as Record<string, string>).error || `API call failed: ${res.status}`);
  return data;
}

async function pollUntilDone(
  type: "image" | "video" | "audio",
  jobId: string,
  maxAttempts = 90,
  intervalMs = 2000
): Promise<{ url: string; type: string }[]> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await apiCall<{
      id: string;
      status: string;
      downloads?: { url: string; type: string }[];
    }>("/api/poll", { type, jobId });

    if (status.status === "complete" && status.downloads) {
      return status.downloads;
    }
    if (status.status === "error" || status.status === "canceled") {
      throw new Error(`Job ${jobId} failed with status: ${status.status}`);
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Job ${jobId} timed out after ${maxAttempts * intervalMs / 1000}s`);
}

// === Hook ===

export function useGeneration() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startGeneration = useCallback(
    async (
      platform: "twitter" | "instagram",
      handle: string,
      features: FeatureConfig,
      userInput?: { bio?: string; vibes?: string }
    ) => {
      try {
        dispatch({ type: "RESET" });

        // Step 1: Scrape profile
        dispatch({
          type: "SET_STATUS",
          status: "scraping",
          step: "Stalking your profile...",
          percent: 10,
        });

        const scrapeResult = await apiCall<{
          success: boolean;
          profile: ProfileData;
        }>("/api/scrape", { platform, handle });

        // Merge user-provided bio/vibes into scraped profile
        const profile = { ...scrapeResult.profile };
        if (userInput?.bio) {
          // User bio supplements scraped bio
          profile.bio = profile.bio
            ? `${profile.bio} | ${userInput.bio}`
            : userInput.bio;
        }
        if (userInput?.vibes) {
          profile.recent_posts = [
            ...profile.recent_posts,
            ...userInput.vibes.split("\n").filter(Boolean),
          ];
        }
        // Ensure there's always some context for the AI
        if (!profile.bio && !profile.recent_posts.length) {
          profile.bio = `${platform} user @${handle}`;
          profile.recent_posts = [`Social media personality @${handle}`];
        }

        dispatch({ type: "SET_PROFILE", profile });

        // Step 2: Generate creative briefs
        dispatch({
          type: "SET_STATUS",
          status: "briefing",
          step: "Writing your origin story...",
          percent: 25,
        });

        const briefResult = await apiCall<{
          success: boolean;
          briefs: CreativeBriefs;
        }>("/api/brief", {
          profile,
          features,
        });

        dispatch({ type: "SET_BRIEFS", briefs: briefResult.briefs });

        // Step 3: Fire generation jobs
        dispatch({
          type: "SET_STATUS",
          status: "generating",
          step: "Generating your content...",
          percent: 40,
        });

        const briefs = briefResult.briefs;
        const outputs: GenerationOutputs = {};

        // === Meme Pack ===
        if (features.memes && briefs.memes) {
          dispatch({
            type: "SET_STATUS",
            status: "generating",
            step: "Creating your meme pack...",
            percent: 45,
          });

          // Fire all meme jobs in parallel
          const memeJobIds = await Promise.all(
            briefs.memes.map((m) =>
              apiCall<{ success: boolean; jobId: string }>("/api/generate", {
                type: "meme",
                template: m.template,
                topic: m.topic,
              }).then((r) => r.jobId)
            )
          );

          dispatch({ type: "ADD_JOBS", feature: "memes", jobIds: memeJobIds });

          // Poll all meme jobs
          dispatch({
            type: "SET_STATUS",
            status: "polling",
            step: "Waiting for memes...",
            percent: 55,
          });

          const memeResults = await Promise.all(
            memeJobIds.map((id) => pollUntilDone("image", id))
          );

          outputs.memes = memeResults.map((downloads, i) => ({
            image_url: downloads[0]?.url || "",
            topic: briefs.memes![i].topic,
          })) as MemeOutput[];
        }

        // === Anime Intro ===
        if (features.anime && briefs.anime) {
          dispatch({
            type: "SET_STATUS",
            status: "generating",
            step: "Generating your anime form...",
            percent: 60,
          });

          // Fire image + voice in parallel
          const [imageResult, voiceResult] = await Promise.all([
            apiCall<{ success: boolean; jobId: string }>("/api/generate", {
              type: "image",
              prompt: briefs.anime.scene_prompt,
              tool: "ai-anime-generator",
            }),
            apiCall<{ success: boolean; jobId: string }>("/api/generate", {
              type: "voice",
              script: trimScriptForDuration(briefs.anime.voice_script, features.videoDuration),
              voiceName: briefs.anime.voice_name,
            }),
          ]);

          dispatch({
            type: "ADD_JOBS",
            feature: "anime",
            jobIds: [imageResult.jobId, voiceResult.jobId],
          });

          // Poll image + voice in parallel
          dispatch({
            type: "SET_STATUS",
            status: "polling",
            step: "Waiting for anime portrait...",
            percent: 70,
          });

          const [imageDownloads, voiceDownloads] = await Promise.all([
            pollUntilDone("image", imageResult.jobId),
            pollUntilDone("audio", voiceResult.jobId),
          ]);

          const animeImageUrl = imageDownloads[0]?.url || "";
          const animeVoiceUrl = voiceDownloads[0]?.url || "";

          outputs.anime = {
            image_url: animeImageUrl,
            voice_url: animeVoiceUrl,
          };

          // Upload the completed image for video generation
          dispatch({
            type: "SET_STATUS",
            status: "generating_video",
            step: "Animating your intro...",
            percent: 80,
          });

          const uploadResult = await apiCall<{
            success: boolean;
            filePath: string;
          }>("/api/upload", { imageUrl: animeImageUrl });

          const videoResult = await apiCall<{
            success: boolean;
            jobId: string;
          }>("/api/generate", {
            type: "video",
            imageFilePath: uploadResult.filePath,
            durationSec: features.videoDuration,
            prompt:
              "Character moves their head slightly, hair blowing in wind, eyes glowing with energy, dramatic anime action pose, particles and energy effects swirling around, cinematic anime scene",
          });

          dispatch({
            type: "SET_STATUS",
            status: "polling_video",
            step: "Rendering your anime intro...",
            percent: 85,
          });

          const videoDownloads = await pollUntilDone(
            "video",
            videoResult.jobId
          );
          outputs.anime.video_url = videoDownloads[0]?.url || "";
        }

        // === Roast Video ===
        if (features.roast && briefs.roast) {
          dispatch({
            type: "SET_STATUS",
            status: "generating",
            step: "Preparing your roast...",
            percent: 60,
          });

          const [imageResult, voiceResult] = await Promise.all([
            apiCall<{ success: boolean; jobId: string }>("/api/generate", {
              type: "image",
              prompt: briefs.roast.roast_card_prompt,
              tool: "ai-photo-generator",
            }),
            apiCall<{ success: boolean; jobId: string }>("/api/generate", {
              type: "voice",
              script: trimScriptForDuration(briefs.roast.voice_script, features.videoDuration),
              voiceName: briefs.roast.voice_name,
            }),
          ]);

          dispatch({
            type: "SET_STATUS",
            status: "polling",
            step: "Waiting for roast card...",
            percent: 70,
          });

          const [imageDownloads, voiceDownloads] = await Promise.all([
            pollUntilDone("image", imageResult.jobId),
            pollUntilDone("audio", voiceResult.jobId),
          ]);

          const roastImageUrl = imageDownloads[0]?.url || "";

          outputs.roast = {
            image_url: roastImageUrl,
            voice_url: voiceDownloads[0]?.url || "",
          };

          // Generate roast video
          dispatch({
            type: "SET_STATUS",
            status: "generating_video",
            step: "Rendering your roast video...",
            percent: 80,
          });

          const uploadResult = await apiCall<{
            success: boolean;
            filePath: string;
          }>("/api/upload", { imageUrl: roastImageUrl });

          const videoResult = await apiCall<{
            success: boolean;
            jobId: string;
          }>("/api/generate", {
            type: "video",
            imageFilePath: uploadResult.filePath,
            durationSec: features.videoDuration,
            prompt: "Camera slowly pushes in on the subject, dramatic lighting shifts, slight head turn, intense stare, smoke or fire particles in the background",
          });

          const videoDownloads = await pollUntilDone(
            "video",
            videoResult.jobId
          );
          outputs.roast.video_url = videoDownloads[0]?.url || "";
        }

        // === Fake Trailer ===
        if (features.trailer.enabled && briefs.trailer) {
          dispatch({
            type: "SET_STATUS",
            status: "generating",
            step: "Shooting your trailer...",
            percent: 60,
          });

          const [imageResult, voiceResult] = await Promise.all([
            apiCall<{ success: boolean; jobId: string }>("/api/generate", {
              type: "image",
              prompt: briefs.trailer.scene_prompt,
              tool: "movie-poster-generator",
            }),
            apiCall<{ success: boolean; jobId: string }>("/api/generate", {
              type: "voice",
              script: trimScriptForDuration(briefs.trailer.voice_script, features.videoDuration),
              voiceName: briefs.trailer.voice_name,
            }),
          ]);

          dispatch({
            type: "SET_STATUS",
            status: "polling",
            step: "Waiting for trailer poster...",
            percent: 70,
          });

          const [imageDownloads, voiceDownloads] = await Promise.all([
            pollUntilDone("image", imageResult.jobId),
            pollUntilDone("audio", voiceResult.jobId),
          ]);

          const trailerImageUrl = imageDownloads[0]?.url || "";

          outputs.trailer = {
            image_url: trailerImageUrl,
            voice_url: voiceDownloads[0]?.url || "",
          };

          dispatch({
            type: "SET_STATUS",
            status: "generating_video",
            step: "Rendering your trailer...",
            percent: 80,
          });

          const uploadResult = await apiCall<{
            success: boolean;
            filePath: string;
          }>("/api/upload", { imageUrl: trailerImageUrl });

          const videoResult = await apiCall<{
            success: boolean;
            jobId: string;
          }>("/api/generate", {
            type: "video",
            imageFilePath: uploadResult.filePath,
            durationSec: features.videoDuration,
            prompt:
              "Photorealistic cinematic scene, character turns head dramatically, cape or clothing billows in wind, lightning or sparks in background, epic blockbuster movie feel, realistic human movement",
          });

          const videoDownloads = await pollUntilDone(
            "video",
            videoResult.jobId
          );
          outputs.trailer.video_url = videoDownloads[0]?.url || "";
        }

        // All done
        dispatch({ type: "SET_OUTPUTS", outputs });
        dispatch({
          type: "SET_STATUS",
          status: "complete",
          step: "Your content is ready!",
          percent: 100,
        });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          error:
            error instanceof Error ? error.message : "Something went wrong",
        });
      }
    },
    []
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return { state, startGeneration, reset };
}
