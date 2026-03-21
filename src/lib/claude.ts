import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProfileData, FeatureConfig, CreativeBriefs } from "./types";

// Valid Magic Hour voice names — API rejects anything else
const VALID_VOICES = [
  "Morgan Freeman", "Samuel L. Jackson", "James Earl Jones", "David Attenborough",
  "Elon Musk", "Mark Zuckerberg", "Joe Rogan", "Barack Obama", "Kanye West",
  "Donald Trump", "Joe Biden", "Kim Kardashian", "Taylor Swift", "Jeff Goldblum",
  "Sean Connery", "Cillian Murphy", "Anne Hathaway", "Julia Roberts", "Natalie Portman",
  "Steve Carell", "Amy Poehler", "Stephen Colbert", "Jimmy Fallon", "Gordon Ramsay",
  "Jack Black", "Donald Glover", "Chris Hemsworth", "Hugh Jackman", "Ben Stiller",
  "Charlie Day", "Jared Leto", "Kristen Bell", "Kristen Wiig", "Jason Bateman",
  "Josh Brolin", "Daniel Craig", "Henry Cavill", "Dave Bautista", "Bruno Mars",
  "Katy Perry", "Drake Bell", "Hailee Steinfeld", "J. K. Simmons",
] as const;

const SYSTEM_PROMPT = `You are a gen-z meme lord and creative director for viral social media AI content. Given a user's social profile, generate creative briefs for AI media generation tools.

Rules:
- Be vivid and specific in visual descriptions (these will be sent to an AI image generator)
- Match the energy and personality of the user's actual profile
- Voiceover scripts must be 1-2 short sentences, under 120 characters total (this is critical — longer scripts will be cut off)
- For anime scenes: describe lighting, pose, atmosphere, specific anime art style cues. Must look like anime/manga art.
- For trailers: write in dramatic movie trailer narrator style. The scene_prompt MUST describe a PHOTOREALISTIC cinematic movie poster — NOT anime or cartoon. Use terms like "photorealistic", "cinematic", "blockbuster movie poster", "real human".
- For roasts: savage but fun, gen-z humor. The roast_card_prompt MUST describe a PHOTOREALISTIC image, not anime. NEVER make jokes about race, sex, religion, or sexuality
- For voice_name fields: you MUST use ONLY one of these exact names: ${VALID_VOICES.slice(0, 20).join(", ")}
  - For anime/trailer: use dramatic voices like "Morgan Freeman", "James Earl Jones", "Samuel L. Jackson", "David Attenborough", "Cillian Murphy"
  - For roasts: use funny voices like "Steve Carell", "Jack Black", "Gordon Ramsay", "Donald Trump", "Joe Rogan"
- For memes:
  - You MUST use ONLY these exact template names: "Random", "Drake Hotline Bling", "Galaxy Brain", "Two Buttons", "Gru's Plan", "Tuxedo Winnie The Pooh", "Is This a Pigeon", "Panik Kalm Panik", "Disappointed Guy", "Waiting Skeleton", "Bike Fall", "Change My Mind", "Side Eyeing Chloe"
  - NEVER make generic memes about follower counts or "posting content"
  - Make memes about the person's ACTUAL interests, job, hobbies, or post topics
  - Use gen-z/millennial humor: situational irony, absurdist escalation, niche references, "no one: / me:" energy
  - The topic field should read like a funny tweet or meme caption, not a description
  - Reference specific things from their bio or posts — the more specific, the funnier

Respond ONLY with valid JSON matching the schema provided. No markdown, no backticks, no extra text.`;

/** Ensure a voice_name is valid for Magic Hour, fallback to a safe default */
function sanitizeVoiceName(name: string | undefined, style: "dramatic" | "funny"): string {
  if (name && VALID_VOICES.includes(name as typeof VALID_VOICES[number])) {
    return name;
  }
  return style === "funny" ? "Steve Carell" : "Morgan Freeman";
}

/** Validate all voice names and script lengths in briefs before returning */
function sanitizeBriefs(briefs: CreativeBriefs): CreativeBriefs {
  if (briefs.anime) {
    briefs.anime.voice_name = sanitizeVoiceName(briefs.anime.voice_name, "dramatic");
    briefs.anime.voice_script = briefs.anime.voice_script.slice(0, 120);
  }
  if (briefs.trailer) {
    briefs.trailer.voice_name = sanitizeVoiceName(briefs.trailer.voice_name, "dramatic");
    briefs.trailer.voice_script = briefs.trailer.voice_script.slice(0, 120);
  }
  if (briefs.roast) {
    briefs.roast.voice_name = sanitizeVoiceName(briefs.roast.voice_name, "funny");
    briefs.roast.voice_script = briefs.roast.voice_script.slice(0, 120);
  }
  return briefs;
}

export async function generateCreativeBriefs(
  profile: ProfileData,
  features: FeatureConfig
): Promise<CreativeBriefs> {
  try {
    const briefs = await generateWithGemini(profile, features);
    return sanitizeBriefs(briefs);
  } catch (error) {
    console.warn(
      "Gemini API failed, using template fallback:",
      error instanceof Error ? error.message : error
    );
    return generateTemplateBriefs(profile, features);
  }
}

async function generateWithGemini(
  profile: ProfileData,
  features: FeatureConfig
): Promise<CreativeBriefs> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const enabledFeatures: string[] = [];
  if (features.anime) enabledFeatures.push("anime");
  if (features.trailer.enabled) enabledFeatures.push("trailer");
  if (features.roast) enabledFeatures.push("roast");
  if (features.memes) enabledFeatures.push("memes");

  const userMessage = `Generate creative briefs for this social media profile:

Platform: ${profile.platform}
Handle: @${profile.handle}
Name: ${profile.display_name}
Bio: ${profile.bio}
Recent Posts: ${profile.recent_posts.join(" | ")}
Followers: ${profile.follower_count}
Following: ${profile.following_count}

Features requested: ${enabledFeatures.join(", ")}
${features.trailer.enabled && features.trailer.genre ? `Trailer genre: ${features.trailer.genre}` : ""}

Output JSON schema:
{
  "anime": {
    "scene_prompt": "detailed image generation prompt for anime portrait",
    "archetype": "2-3 word character title",
    "tagline": "short dramatic tagline",
    "voice_script": "narrator introduction script (MUST be under 120 chars)",
    "voice_name": "celebrity voice name"
  },
  "trailer": {
    "scene_prompt": "cinematic image generation prompt for movie poster",
    "movie_title": "fake movie title in caps",
    "tagline": "movie tagline",
    "voice_script": "dramatic trailer narration (MUST be under 120 chars)",
    "voice_name": "celebrity voice name"
  },
  "roast": {
    "roast_card_prompt": "image generation prompt for a roast-style portrait/card",
    "voice_script": "the roast itself (MUST be under 120 chars)",
    "voice_name": "comedian celebrity voice"
  },
  "memes": [
    { "template": "meme template name", "topic": "personalized meme topic" },
    { "template": "meme template name", "topic": "personalized meme topic" },
    { "template": "meme template name", "topic": "personalized meme topic" }
  ]
}

Only include keys for requested features.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
    systemInstruction: { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 2000,
    },
  });

  const text = result.response.text();
  return JSON.parse(text) as CreativeBriefs;
}

/**
 * Template-based fallback when Gemini API is unavailable.
 */
function generateTemplateBriefs(
  profile: ProfileData,
  features: FeatureConfig
): CreativeBriefs {
  const name = profile.display_name || profile.handle;
  const bio = profile.bio || `${profile.platform} user`;
  const handle = profile.handle;
  const posts = profile.recent_posts || [];
  const firstPost = posts[0] || "";
  const briefs: CreativeBriefs = {};

  // Extract keywords from bio/posts for personalization
  const context = `${bio} ${posts.join(" ")}`.toLowerCase();
  const isTechy = /engineer|dev|code|tech|software|data|ai|ml|hack/i.test(context);
  const isCreative = /art|design|photo|music|film|write|creat/i.test(context);
  const isFitness = /gym|fit|sport|arch|coach|athlet|train|run/i.test(context);
  const isStudent = /student|university|college|grad|study/i.test(context);

  if (features.memes) {
    // Pick memes based on actual profile content
    const memes: { template: string; topic: string }[] = [];

    if (isFitness) {
      memes.push({
        template: "Drake Hotline Bling",
        topic: `${name}: sleeping in vs 5am training arc because the grind never stops`,
      });
    } else if (isTechy) {
      memes.push({
        template: "Drake Hotline Bling",
        topic: `${name}: fixing the bug vs adding 3 new features nobody asked for`,
      });
    } else {
      memes.push({
        template: "Drake Hotline Bling",
        topic: `${name}: touching grass vs crafting the perfect ${profile.platform} post at 3am`,
      });
    }

    if (firstPost) {
      memes.push({
        template: "Change My Mind",
        topic: `${firstPost.slice(0, 80)}${firstPost.length > 80 ? "..." : ""}`,
      });
    } else {
      memes.push({
        template: "Galaxy Brain",
        topic: `${name} realizing their ${bio.slice(0, 40)} energy is actually their whole personality`,
      });
    }

    if (isStudent) {
      memes.push({
        template: "Panik Kalm Panik",
        topic: `${name}: deadline tomorrow / already started / "started" means opened the doc`,
      });
    } else if (isFitness) {
      memes.push({
        template: "Gru's Plan",
        topic: `${name}: get coaching certification → build archery empire → realize you still can't hit bullseye on Mondays`,
      });
    } else if (isCreative) {
      memes.push({
        template: "Two Buttons",
        topic: `${name} choosing between starting a new project and finishing literally any existing one`,
      });
    } else {
      memes.push({
        template: "Is This a Pigeon",
        topic: `${name} looking at their ${profile.platform} bio and asking "is this a personality?"`,
      });
    }

    briefs.memes = memes;
  }

  if (features.anime) {
    briefs.anime = {
      scene_prompt: `A powerful anime character standing on a rooftop at sunset, neon city skyline behind them, dramatic wind blowing through their hair, cyberpunk aesthetic, detailed anime art style, vibrant colors, inspired by ${name}'s persona as ${bio.slice(0, 60)}`,
      archetype: "Digital Sovereign",
      tagline: `The one they call @${handle}`,
      voice_script: `They call them ${name}. And this is their origin story.`,
      voice_name: "Morgan Freeman",
    };
  }

  if (features.roast) {
    const roastLine = isFitness
      ? `${name}, coaching archery like Hawkeye's unpaid intern. Absolute main character delusion.`
      : isTechy
        ? `${name}, your commit history looks like a cry for help. Even ChatGPT would ghost you.`
        : `${name}, your whole vibe is "I peaked in the group chat." Even your bio is mid.`;
    briefs.roast = {
      roast_card_prompt: `A dramatic mugshot-style portrait with red warning stamps, "PROFILE UNDER REVIEW" text overlay, FBI-style dossier aesthetic, dark moody lighting, wanted poster style for @${handle}`,
      voice_script: roastLine.slice(0, 120),
      voice_name: "Steve Carell",
    };
  }

  if (features.trailer.enabled) {
    const genre = features.trailer.genre || "Action";
    briefs.trailer = {
      scene_prompt: `Photorealistic cinematic ${genre} movie poster, a real human in a dramatic heroic pose, ${genre === "Horror" ? "dark foggy atmosphere with shadows" : "epic golden hour lighting with lens flare"}, blockbuster Hollywood movie poster style, photorealistic photography, dramatic composition, inspired by @${handle} who is ${bio.slice(0, 60)}`,
      movie_title: `THE ${name.toUpperCase()} CHRONICLES`,
      tagline: "Some stories can't be contained in a bio",
      voice_script: `This summer, ${name} discovers being a main character is a destiny.`,
      voice_name: "James Earl Jones",
    };
  }

  return briefs;
}
