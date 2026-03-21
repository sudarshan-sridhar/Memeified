# API Integration Guide

## Magic Hour API

### Authentication
All requests require Bearer token authentication:
```
Authorization: Bearer <MAGIC_HOUR_API_KEY>
```

### Base URL
```
https://api.magichour.ai/v1
```

### File Upload Flow (Required Before Any Generation Using User Assets)

```typescript
// Step 1: Get pre-signed upload URL
const uploadRes = await fetch("https://api.magichour.ai/v1/files/upload-urls", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${MAGIC_HOUR_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    items: [{ type: "image", extension: "png" }]
  })
});
const { items } = await uploadRes.json();
// items[0] = { upload_url, expires_at, file_path }

// Step 2: Upload the file via PUT
await fetch(items[0].upload_url, {
  method: "PUT",
  body: imageBuffer  // raw file bytes
});

// Step 3: Use file_path in generation calls
const filePath = items[0].file_path;  // e.g., "api-assets/id/image.png"
```

### Endpoint Reference

#### AI Image Generator
```typescript
// POST /v1/ai-image-generator
{
  image_count: 1,
  style: {
    prompt: "A warrior in dark anime style, glowing eyes, cyberpunk city background",
    tool: "ai-anime-generator"  // Use this for anime outputs
  },
  model: "flux-schnell",  // 5 credits, fastest
  aspect_ratio: "9:16",   // Vertical for social sharing
  resolution: "auto"
}
// Response: { id: "cuid-xxx", credits_charged: 5 }
```

#### AI Meme Generator
```typescript
// POST /v1/ai-meme-generator
{
  style: {
    template: "Drake Hotline Bling",  // Known meme template name
    topic: "When the code finally compiles vs when you see the output",
    search_web: false
  },
  name: "Profile Meme - @username"
}
// Response: { id: "cuid-xxx", credits_charged: 10 }
```

#### AI Voice Generator
```typescript
// POST /v1/ai-voice-generator
{
  style: {
    prompt: "In a world where deadlines are just suggestions...",
    voice_name: "Morgan Freeman"  // Celebrity voice
  },
  name: "Anime Intro Narration"
}
// Response: { id: "cuid-xxx", credits_charged: 1 }
// Cost: 0.05 credits per character
```

#### Image-to-Video
```typescript
// POST /v1/image-to-video
{
  assets: {
    image_file_path: "api-assets/id/image.png"  // From upload or completed image job
  },
  end_seconds: 5,        // Keep short for speed + credits
  model: "default",       // Kling 2.5 Audio (generates with sound)
  resolution: "720p",
  style: {
    prompt: "Slow dramatic zoom in, wind blowing through hair, particles floating"
  }
}
// Response: { id: "cuid-xxx", credits_charged: 450 }
```

#### Face Swap Photo
```typescript
// POST /v1/face-swap-photo
{
  assets: {
    source_file_path: "api-assets/id/user-face.png",   // User's profile pic
    target_file_path: "api-assets/id/hero-poster.png"   // Generated poster
  },
  name: "Trailer Face Swap"
}
// Response: { id: "cuid-xxx", credits_charged: 25 }
```

### Polling for Completion

```typescript
// For images: GET /v1/image-projects/{id}
// For videos: GET /v1/video-projects/{id}
// For audio:  GET /v1/audio-projects/{id}

async function pollForCompletion(
  type: "image" | "video" | "audio",
  jobId: string,
  maxAttempts = 60,
  intervalMs = 2000
): Promise<any> {
  const endpoint = `${type}-projects`;
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`https://api.magichour.ai/v1/${endpoint}/${jobId}`, {
      headers: { "Authorization": `Bearer ${MAGIC_HOUR_API_KEY}` }
    });
    const data = await res.json();

    if (data.status === "complete") {
      return data.downloads;  // Array of { url, type }
    }
    if (data.status === "error" || data.status === "canceled") {
      throw new Error(`Job ${jobId} failed: ${data.status}`);
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`Job ${jobId} timed out`);
}
```

---

## Claude API (Prompt Generation Layer)

### Authentication
```
x-api-key: <ANTHROPIC_API_KEY>
```

### Single Call for All Creative Briefs

```typescript
// POST https://api.anthropic.com/v1/messages
{
  model: "claude-sonnet-4-20250514",
  max_tokens: 2000,
  system: `You are a creative director for viral social media AI content. Given a user's social profile, generate creative briefs for AI media generation tools.

Rules:
- Be vivid and specific in visual descriptions (these will be sent to an AI image generator)
- Match the energy and personality of the user's actual profile
- Voiceover scripts must be 2-3 sentences, under 200 characters total
- For anime scenes: describe lighting, pose, atmosphere, specific art style cues
- For trailers: write in dramatic movie trailer narrator style
- For roasts: savage but fun. NEVER make jokes about race, sex, religion, or sexuality
- For memes: use actually popular meme templates, make them specific to this person

Respond ONLY with valid JSON matching the schema below. No markdown, no backticks.`,

  messages: [{
    role: "user",
    content: `Generate creative briefs for this social media profile:

Platform: ${profile.platform}
Handle: @${profile.handle}
Name: ${profile.display_name}
Bio: ${profile.bio}
Recent Posts: ${profile.recent_posts.join(" | ")}
Followers: ${profile.follower_count}
Following: ${profile.following_count}

Features requested: ${features.join(", ")}
${features.includes("trailer") ? `Trailer genre: ${trailerGenre}` : ""}

Output JSON schema:
{
  "anime": {
    "scene_prompt": "detailed image generation prompt for anime portrait",
    "archetype": "2-3 word character title",
    "tagline": "short dramatic tagline",
    "voice_script": "narrator introduction script (under 200 chars)",
    "voice_name": "celebrity voice name"
  },
  "trailer": {
    "scene_prompt": "cinematic image generation prompt for movie poster",
    "movie_title": "fake movie title in caps",
    "tagline": "movie tagline",
    "voice_script": "dramatic trailer narration (under 200 chars)",
    "voice_name": "celebrity voice name"
  },
  "roast": {
    "roast_card_prompt": "image generation prompt for a roast-style portrait/card",
    "voice_script": "the roast itself (under 200 chars)",
    "voice_name": "comedian celebrity voice"
  },
  "memes": [
    { "template": "meme template name", "topic": "personalized meme topic" },
    { "template": "meme template name", "topic": "personalized meme topic" },
    { "template": "meme template name", "topic": "personalized meme topic" }
  ]
}

Only include keys for requested features.`
  }]
}
```

---

## Social Scraping

### Option A: Apify (Recommended for Hackathon)
Apify provides ready-made scrapers for Twitter and Instagram that handle rate limits and anti-bot measures.

```typescript
// Twitter scraper
const twitterRun = await apifyClient.actor("apidojo/twitter-user-scraper").call({
  handles: [handle],
  maxTweets: 10
});

// Instagram scraper
const igRun = await apifyClient.actor("apify/instagram-profile-scraper").call({
  usernames: [handle],
  maxPosts: 10
});
```

### Option B: Direct Scraping (Fallback)
For Twitter/X, use the public profile page or nitter instances.
For Instagram, use the public profile JSON endpoint (may require cookies).

### Data Normalization
Regardless of source, normalize to:
```typescript
interface ProfileData {
  platform: "twitter" | "instagram";
  handle: string;
  display_name: string;
  bio: string;
  profile_pic_url: string;
  recent_posts: string[];
  follower_count: number;
  following_count: number;
}
```

---

## Credit Budget Per User Session

| Feature | Endpoint | Credits |
|---------|----------|---------|
| Anime portrait | AI Image Generator (flux-schnell) | 5 |
| Anime voice | AI Voice Generator (~150 chars) | 8 |
| Anime video | Image-to-Video (5s, 720p) | ~450 |
| Trailer poster | AI Image Generator | 5 |
| Trailer voice | AI Voice Generator (~150 chars) | 8 |
| Trailer video | Image-to-Video (5s) | ~450 |
| Roast card | AI Image Generator | 5 |
| Roast voice | AI Voice Generator (~150 chars) | 8 |
| Roast video | Image-to-Video (5s) | ~450 |
| Meme x3 | AI Meme Generator | 30 |
| **Total (all features)** | | **~1,419** |
| **Minimum (memes only)** | | **30** |

Strategy: Let users pick which features they want. Default to memes + anime (fastest and cheapest). Show credit cost estimate before generating.
