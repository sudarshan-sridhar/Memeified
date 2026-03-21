# Architecture Document - Main Character Energy (MCE)

## System Overview

MCE is a Next.js web application that transforms social media handles into AI-generated shareable content. It combines social scraping, LLM-powered prompt engineering, and Magic Hour's media generation API to produce anime intros, fake trailers, roast videos, and meme packs.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js + R3F)                │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Landing   │  │ Create   │  │ Loading  │  │ Result     │  │
│  │ Page (3D) │->│ Page     │->│ Page     │->│ Page       │  │
│  │           │  │ (Input)  │  │ (Status) │  │ (Shareable)│  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│       Three.js / React Three Fiber / GSAP throughout        │
└───────────────────────┬─────────────────────────────────────┘
                        │ API Routes
                        v
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Next.js API Routes)              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ /api/scrape   │  │ /api/generate │  │ /api/status/[id] │  │
│  │              │  │              │  │                  │  │
│  │ Scrape social│  │ Orchestrate  │  │ Poll Magic Hour  │  │
│  │ profile data │  │ full pipeline│  │ for completion   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │
│         │                 │                                  │
└─────────┼─────────────────┼──────────────────────────────────┘
          │                 │
          v                 v
┌──────────────┐  ┌──────────────────────────────────────────┐
│ Social APIs  │  │         AI Pipeline                      │
│              │  │                                          │
│ Twitter/X    │  │  ┌─────────┐    ┌─────────────────────┐  │
│ Instagram    │  │  │ Claude  │--->│ Magic Hour API       │  │
│ (via Apify   │  │  │ API     │    │                     │  │
│  or direct)  │  │  │         │    │ - Image Generator   │  │
│              │  │  │ Generate│    │ - Voice Generator   │  │
└──────────────┘  │  │ prompts │    │ - Image-to-Video    │  │
                  │  │ & briefs│    │ - Meme Generator    │  │
                  │  └─────────┘    │ - Face Swap Photo   │  │
                  │                 └─────────────────────┘  │
                  └──────────────────────────────────────────┘
```

---

## Frontend Architecture

### Page Structure

```
/ (Landing Page)
├── 3D Hero Scene (React Three Fiber)
│   ├── Floating meme cards with mouse parallax
│   ├── Rotating social media icons (Twitter, Instagram)
│   ├── Particle effect background (cyberpunk/neon)
│   └── Animated text reveals on scroll
├── Feature Showcase Section (scroll-triggered)
│   ├── Anime Intro preview card (3D tilt)
│   ├── Fake Trailer preview card (3D tilt)
│   ├── Roast Video preview card (3D tilt)
│   └── Meme Pack preview card (3D tilt)
├── How It Works Section
│   └── 3-step animated flow: Enter Handle -> AI Magic -> Share
└── CTA Section
    └── "Drop Your Handle" button -> /create

/create (Input Page)
├── 3D background (continues from landing page scene)
├── Platform selector (Twitter/X or Instagram) - animated toggle
├── Handle input field with @ prefix
├── Feature selector (which outputs to generate)
│   ├── Anime Intro (toggle)
│   ├── Fake Trailer (toggle + genre picker)
│   ├── Roast Video (toggle)
│   └── Meme Pack (toggle)
└── "Generate" button with loading state

/loading/[session-id] (Loading Page)
├── 3D loading animation (building the "main character")
├── Step-by-step progress tracker
│   ├── "Stalking your profile..." 
│   ├── "Writing your origin story..."
│   ├── "Generating your anime form..."
│   ├── "Recording the narration..."
│   └── "Rendering your moment..."
└── Real-time status from Magic Hour polling

/result/[session-id] (Result Page - also the shareable URL)
├── 3D background with celebratory particles
├── Generated content display
│   ├── Video player for anime intro / trailer / roast
│   ├── Meme grid for meme pack
│   └── Individual share buttons per item
├── Share bar (Twitter, Instagram, Copy Link, Download All)
├── "Make Yours" CTA button (prominent)
├── "Powered by Magic Hour" badge with link
└── "See what else Magic Hour can do" section
```

### 3D Scene Components (React Three Fiber)

```
ThreeScene/
├── MemeCard3D.tsx          # Floating 3D card with texture, mouse-reactive tilt
├── SocialIcon3D.tsx        # Rotating platform icons (X bird, Instagram camera)
├── ParticleField.tsx       # Background particle system (neon colors)
├── FloatingText3D.tsx      # 3D text that animates in on scroll
├── CyberpunkGrid.tsx       # Retro-futuristic grid floor
├── LoadingAvatar.tsx       # 3D character being "built" during generation
├── FeaturePortal3D.tsx     # 3D portal/doorway for each feature
└── CameraController.tsx    # Scroll-driven and mouse-driven camera movement
```

---

## Backend Architecture

### API Routes

#### `POST /api/scrape`
```typescript
// Input
{ platform: "twitter" | "instagram", handle: string }

// Process
1. Validate handle format
2. Check if profile is public
3. Scrape: pfp, bio, display_name, recent_posts, follower_count
4. Download profile picture to temp storage

// Output
{ success: boolean, profile: ProfileData, error?: string }
```

#### `POST /api/generate`
```typescript
// Input
{
  profile: ProfileData,
  features: {
    anime: boolean,
    trailer: { enabled: boolean, genre?: string },
    roast: boolean,
    memes: boolean
  }
}

// Process
1. Call Claude API with profile data -> get creative briefs for all selected features
2. Upload profile pic to Magic Hour (generate upload URL -> PUT file -> get file_path)
3. Fire Magic Hour generation jobs in parallel:
   a. Image Generator (anime portrait / trailer poster / roast card)
   b. Voice Generator (narrator scripts)
   c. Meme Generator (3-4 memes)
4. Wait for image jobs to complete (poll)
5. Feed completed images into Image-to-Video for animated clips
6. Wait for video jobs to complete (poll)
7. Store all output URLs in session

// Output
{ session_id: string, status: "processing" }
```

#### `GET /api/status/[session-id]`
```typescript
// Process
1. Check all pending Magic Hour job statuses
2. Return current progress and any completed outputs

// Output
{
  status: "processing" | "complete" | "error",
  progress: { step: string, percent: number },
  outputs: {
    anime?: { image_url, video_url, voice_url },
    trailer?: { image_url, video_url, voice_url },
    roast?: { image_url, video_url, voice_url },
    memes?: [{ image_url, topic }]
  }
}
```

---

## Data Flow Per Feature

### Anime Intro Pipeline
```
Profile Data
    |
    v
[Claude API] -> Generate:
    - anime_scene_prompt: "A lone warrior stands atop a neon-lit skyscraper..."
    - character_archetype: "The Silent Architect"
    - character_tagline: "Code is his weapon. Deadlines fear him."
    - voice_script: "In a world of infinite loops... one developer dared to break free."
    - voice_name: "Morgan Freeman"
    |
    v
[Magic Hour - AI Image Generator]
    style: { prompt: anime_scene_prompt, tool: "ai-anime-generator" }
    model: "flux-schnell"  (5 credits, fast)
    |
    v
[Magic Hour - AI Voice Generator]
    style: { prompt: voice_script, voice_name: "Morgan Freeman" }
    (0.05 credits/char)
    |
    v  (after image completes)
[Magic Hour - Image-to-Video]
    assets: { image_file_path: completed_image_path }
    end_seconds: 5
    model: "kling-2.5-audio" (generates with audio)
    |
    v
[Result] -> Anime intro video + voice audio + static portrait
```

### Fake Trailer Pipeline
```
Profile Data + Selected Genre (e.g., "Marvel")
    |
    v
[Claude API] -> Generate:
    - trailer_scene_prompt: "Cinematic wide shot, a figure in a dark suit walks away from an explosion..."
    - movie_title: "THE LAST COMMIT"
    - tagline: "When the codebase fights back."
    - voice_script: "This summer... one developer discovers that the real bugs... were inside him all along."
    - voice_name: "Epic Movie Trailer Guy"
    |
    v
[Parallel]
    [Magic Hour - AI Image Generator] -> cinematic poster image
    [Magic Hour - AI Voice Generator] -> dramatic narration
    |
    v
[Magic Hour - Face Swap Photo] (optional)
    Swap user's face onto the hero in the poster
    |
    v
[Magic Hour - Image-to-Video]
    Animate the poster into a short trailer clip
    |
    v
[Result] -> Trailer video + poster image
```

### Roast Video Pipeline
```
Profile Data (deep analysis: bio cringe, post patterns, pfp energy)
    |
    v
[Claude API] -> Generate:
    - roast_script: "Bro has 47 followers and a bio that says 'entrepreneur'..."
    - roast_card_prompt: "A mugshot-style portrait with 'PROFILE UNDER REVIEW' stamp..."
    - voice_name: "Kevin Hart" or "Joe Rogan"
    |
    v
[Parallel]
    [Magic Hour - AI Image Generator] -> roast card image
    [Magic Hour - AI Voice Generator] -> roast narration
    |
    v
[Magic Hour - Image-to-Video]
    Animate roast card with dramatic reveal
    |
    v
[Result] -> Roast video + roast card image
```

### Meme Pack Pipeline
```
Profile Data
    |
    v
[Claude API] -> Generate:
    - meme_topics: [
        { template: "Drake Hotline Bling", topic: "Writing clean code vs shipping at 3am" },
        { template: "Distracted Boyfriend", topic: "When your side project gets more stars than your work project" },
        { template: "This Is Fine", topic: "Deploying on a Friday" },
        { template: "Expanding Brain", topic: "Evolution of your debugging strategy" }
      ]
    |
    v
[Magic Hour - AI Meme Generator] x4 (parallel)
    Each: style: { template, topic, search_web: false }
    (10 credits each = 40 credits)
    |
    v
[Result] -> Grid of 4 memes with individual share buttons
```

---

## Session Storage

Use a simple in-memory store (Map) for hackathon. Each session stores:

```typescript
interface Session {
  id: string;
  created_at: number;
  profile: ProfileData;
  features_requested: string[];
  creative_briefs: CreativeBriefs;  // Claude API response
  magic_hour_jobs: {
    [feature: string]: {
      image_job_id?: string;
      voice_job_id?: string;
      video_job_id?: string;
      meme_job_ids?: string[];
    }
  };
  outputs: {
    [feature: string]: {
      image_url?: string;
      video_url?: string;
      voice_url?: string;
      meme_urls?: string[];
    }
  };
  status: "scraping" | "generating_briefs" | "generating_media" | "complete" | "error";
  error?: string;
}
```

For production: replace with Redis or a database. For hackathon, in-memory Map is fine since Vercel serverless functions share memory within a single invocation but not across. Consider using Vercel KV if persistence is needed.

---

## Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Time to first output | <15s | Start with fastest endpoint (memes at 10 credits) |
| Full generation | <60s | Parallel API calls, show results as they complete |
| Landing page load | <3s | Code split 3D components, lazy load models |
| Lighthouse score | >70 | Optimize Three.js, compress textures |
| Mobile usable | Yes | Fallback 2D for low-end devices, responsive layout |

---

## Error Handling Strategy

- **Private account:** Show friendly error with suggestion to use a public account
- **Invalid handle:** Validate format before API call, show inline error
- **Magic Hour rate limit:** Queue and retry with exponential backoff
- **Magic Hour generation failure:** Credits are refunded automatically, show retry button
- **Claude API failure:** Fall back to template-based prompts (pre-written generic briefs)
- **Network timeout:** Show retry button with last known state preserved
