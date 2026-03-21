# Phase 3: AI Pipeline

## Goal
Build the integration layer: Claude API for prompt generation, Magic Hour API client for media generation, and the orchestration logic that ties everything together.

---

## Step 1: Magic Hour API Client

Create `src/lib/magic-hour.ts`:

```typescript
const BASE_URL = "https://api.magichour.ai/v1";
const headers = {
  "Authorization": `Bearer ${process.env.MAGIC_HOUR_API_KEY}`,
  "Content-Type": "application/json"
};
```

### Functions to implement:

#### `uploadAsset(buffer: Buffer, extension: string, type: string): Promise<string>`
1. POST `/files/upload-urls` with `[{ type, extension }]`
2. PUT the buffer to `items[0].upload_url`
3. Return `items[0].file_path`

#### `generateImage(prompt: string, tool?: string): Promise<string>`
1. POST `/ai-image-generator` with prompt, model "flux-schnell", tool (default "ai-anime-generator")
2. Return job ID

#### `generateMeme(template: string, topic: string): Promise<string>`
1. POST `/ai-meme-generator` with template, topic, search_web: false
2. Return job ID

#### `generateVoice(script: string, voiceName: string): Promise<string>`
1. POST `/ai-voice-generator` with prompt and voice_name
2. Return job ID

#### `generateVideo(imageFilePath: string, durationSec: number, prompt?: string): Promise<string>`
1. POST `/image-to-video` with image_file_path, end_seconds, model "default", resolution "720p"
2. If prompt provided, include in style.prompt
3. Return job ID

#### `faceSwapPhoto(sourceFace: string, targetImage: string): Promise<string>`
1. POST `/face-swap-photo` with source and target file paths
2. Return job ID

#### `getImageStatus(jobId: string): Promise<JobStatus>`
1. GET `/image-projects/{jobId}`
2. Return { status, downloads }

#### `getVideoStatus(jobId: string): Promise<JobStatus>`
1. GET `/video-projects/{jobId}`
2. Return { status, downloads }

#### `getAudioStatus(jobId: string): Promise<JobStatus>`
1. GET `/audio-projects/{jobId}`
2. Return { status, downloads }

#### `pollUntilComplete(type: "image"|"video"|"audio", jobId: string): Promise<Download[]>`
1. Poll the appropriate status endpoint every 2 seconds
2. Max 60 attempts (2 minutes timeout)
3. Return downloads array on "complete"
4. Throw on "error" or "canceled"

### Type Definitions
```typescript
interface JobStatus {
  id: string;
  status: "queued" | "rendering" | "complete" | "error" | "canceled";
  downloads?: { url: string; type: string }[];
  credits_charged: number;
}

interface Download {
  url: string;
  type: string;
}
```

---

## Step 2: Claude API Client

Create `src/lib/claude.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
```

### Function: `generateCreativeBriefs(profile: ProfileData, features: FeatureConfig): Promise<CreativeBriefs>`

Single API call that generates all creative briefs based on selected features.

System prompt: (see docs/api-integration.md for full prompt)

User message: profile data + feature selection + JSON schema

Parse response as JSON. Handle edge cases:
- If Claude wraps in markdown code blocks, strip them
- If JSON is malformed, retry once with a stricter prompt
- If a feature brief is missing, use a template fallback

### Type Definitions
```typescript
interface FeatureConfig {
  anime: boolean;
  trailer: { enabled: boolean; genre?: string };
  roast: boolean;
  memes: boolean;
}

interface CreativeBriefs {
  anime?: {
    scene_prompt: string;
    archetype: string;
    tagline: string;
    voice_script: string;
    voice_name: string;
  };
  trailer?: {
    scene_prompt: string;
    movie_title: string;
    tagline: string;
    voice_script: string;
    voice_name: string;
  };
  roast?: {
    roast_card_prompt: string;
    voice_script: string;
    voice_name: string;
  };
  memes?: {
    template: string;
    topic: string;
  }[];
}
```

---

## Step 3: Session Storage

Create `src/lib/session.ts`:

```typescript
// In-memory session storage (fine for hackathon)
const sessions = new Map<string, Session>();

export function createSession(profile: ProfileData, features: FeatureConfig): string
export function getSession(id: string): Session | undefined
export function updateSession(id: string, updates: Partial<Session>): void
```

### Session Interface
```typescript
interface Session {
  id: string;
  created_at: number;
  profile: ProfileData;
  features: FeatureConfig;
  briefs?: CreativeBriefs;
  jobs: {
    anime?: { image?: string; voice?: string; video?: string };
    trailer?: { image?: string; voice?: string; video?: string };
    roast?: { image?: string; voice?: string; video?: string };
    memes?: string[];
  };
  outputs: {
    anime?: { image_url?: string; video_url?: string; voice_url?: string };
    trailer?: { image_url?: string; video_url?: string; voice_url?: string };
    roast?: { image_url?: string; video_url?: string; voice_url?: string };
    memes?: { image_url: string; topic: string }[];
  };
  status: "scraping" | "briefing" | "generating" | "complete" | "error";
  progress: { step: string; percent: number };
  error?: string;
}
```

**IMPORTANT NOTE:** Vercel serverless functions are stateless. Each invocation may run in a different container. For the hackathon, this means:
- The `/api/generate` route starts jobs and stores session data
- The `/api/status/[id]` route needs access to the same session
- Solution: Use Vercel KV (Redis) or store session data in a JSON file on `/tmp/`
- Simplest: Pass all job IDs via URL params or a lightweight DB

Consider using `@vercel/kv` if persistence across function invocations is needed:
```bash
npm install @vercel/kv
```

---

## Step 4: Generation Orchestration

Create `src/app/api/generate/route.ts`:

This is the main orchestrator. It:

1. Creates a session
2. Calls Claude API for creative briefs
3. Uploads user's profile picture to Magic Hour
4. Fires off all Magic Hour generation jobs in parallel
5. Returns session ID for polling

```typescript
export async function POST(req: Request) {
  const { profile, features } = await req.json();

  // 1. Create session
  const sessionId = createSession(profile, features);
  updateSession(sessionId, { status: "briefing", progress: { step: "Writing your story...", percent: 10 } });

  // 2. Generate creative briefs (Claude API)
  const briefs = await generateCreativeBriefs(profile, features);
  updateSession(sessionId, { briefs, progress: { step: "Briefs ready!", percent: 20 } });

  // 3. Upload profile pic to Magic Hour
  const pfpBuffer = await downloadImage(profile.profile_pic_url);
  const pfpPath = await uploadAsset(pfpBuffer, "png", "image");

  // 4. Fire generation jobs (don't await - let them run in background)
  // Start processing in the background
  processGeneration(sessionId, briefs, pfpPath, features).catch(err => {
    updateSession(sessionId, { status: "error", error: err.message });
  });

  // 5. Return session ID immediately
  return Response.json({ session_id: sessionId });
}
```

### Background Processing Function
```typescript
async function processGeneration(sessionId, briefs, pfpPath, features) {
  updateSession(sessionId, { status: "generating", progress: { step: "Generating media...", percent: 30 } });

  // Fire all image + voice + meme jobs in parallel
  const jobs = {};

  if (features.anime && briefs.anime) {
    jobs.anime = {
      image: await generateImage(briefs.anime.scene_prompt, "ai-anime-generator"),
      voice: await generateVoice(briefs.anime.voice_script, briefs.anime.voice_name)
    };
  }
  // ... same for trailer, roast
  if (features.memes && briefs.memes) {
    jobs.memes = await Promise.all(
      briefs.memes.map(m => generateMeme(m.template, m.topic))
    );
  }

  updateSession(sessionId, { jobs, progress: { step: "Waiting for images...", percent: 50 } });

  // Poll for image completions
  // Once images complete, feed into image-to-video
  // Poll for video completions
  // Store all output URLs in session
  // Set status to "complete"
}
```

---

## Step 5: Status Polling Route

Create `src/app/api/status/[id]/route.ts`:

```typescript
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = getSession(params.id);
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });

  return Response.json({
    status: session.status,
    progress: session.progress,
    outputs: session.outputs,
    profile: {
      handle: session.profile.handle,
      display_name: session.profile.display_name,
      platform: session.profile.platform
    }
  });
}
```

---

## Step 6: Verify

- [ ] Magic Hour client can upload an image and get a file_path back
- [ ] Magic Hour client can generate an image and poll until complete
- [ ] Magic Hour client can generate a voice clip
- [ ] Magic Hour client can generate a meme
- [ ] Claude API generates valid JSON creative briefs
- [ ] Session creation and retrieval works
- [ ] `/api/generate` accepts profile + features and returns session ID
- [ ] `/api/status/[id]` returns current progress and outputs
- [ ] End-to-end: scrape -> brief -> generate -> poll -> outputs available
