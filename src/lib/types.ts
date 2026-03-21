// === Profile Data (from social scraping) ===

export interface ProfileData {
  platform: "twitter" | "instagram";
  handle: string;
  display_name: string;
  bio: string;
  profile_pic_url: string;
  recent_posts: string[];
  follower_count: number;
  following_count: number;
}

// === Feature Configuration ===

export interface FeatureConfig {
  anime: boolean;
  trailer: { enabled: boolean; genre?: string };
  roast: boolean;
  memes: boolean;
  videoDuration: 5 | 10;
}

export const TRAILER_GENRES = [
  "Marvel",
  "DC",
  "Disney",
  "Pixar",
  "Horror",
  "Action",
  "Sci-Fi",
  "Romance",
  "Thriller",
] as const;

export type TrailerGenre = (typeof TRAILER_GENRES)[number];

// === Creative Briefs (from Claude API) ===

export interface AnimeBrief {
  scene_prompt: string;
  archetype: string;
  tagline: string;
  voice_script: string;
  voice_name: string;
}

export interface TrailerBrief {
  scene_prompt: string;
  movie_title: string;
  tagline: string;
  voice_script: string;
  voice_name: string;
}

export interface RoastBrief {
  roast_card_prompt: string;
  voice_script: string;
  voice_name: string;
}

export interface MemeBrief {
  template: string;
  topic: string;
}

export interface CreativeBriefs {
  anime?: AnimeBrief;
  trailer?: TrailerBrief;
  roast?: RoastBrief;
  memes?: MemeBrief[];
}

// === Magic Hour Job Status ===

export interface JobStatus {
  id: string;
  status: "queued" | "rendering" | "complete" | "error" | "canceled";
  downloads?: Download[];
}

export interface Download {
  url: string;
  type: string;
}

// === Generation Outputs ===

export interface FeatureOutput {
  image_url?: string;
  video_url?: string;
  voice_url?: string;
}

export interface MemeOutput {
  image_url: string;
  topic: string;
}

export interface GenerationOutputs {
  anime?: FeatureOutput;
  trailer?: FeatureOutput;
  roast?: FeatureOutput;
  memes?: MemeOutput[];
}

// === Generation State (client-side) ===

export type GenerationStatus =
  | "idle"
  | "scraping"
  | "briefing"
  | "generating"
  | "polling"
  | "generating_video"
  | "polling_video"
  | "complete"
  | "error";

export interface GenerationState {
  status: GenerationStatus;
  progress: { step: string; percent: number };
  profile?: ProfileData;
  briefs?: CreativeBriefs;
  jobs: Record<string, string[]>; // feature -> job IDs
  outputs: GenerationOutputs;
  error?: string;
}
