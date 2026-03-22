# Main Character Energy

> Drop your handle. Get your anime intro, fake trailer, roast video, and meme pack.

**[Try it live](https://memeified.vercel.app)**

AI takes your Twitter/Instagram profile and turns it into shareable content — personalized memes, anime character intros with voiceover, cinematic fake trailers, and savage roast videos.

Built for **FalconHacks 2025**.

## Features

- **Meme Pack** — 3 personalized memes based on your actual posts and bio
- **Anime Intro** — AI-generated anime portrait + dramatic voiceover + animated video
- **Fake Trailer** — Cinematic movie poster + narrator + video (pick your genre)
- **Roast Video** — AI roasts your profile with a celebrity voice + video

All content is shareable to Twitter/X and Instagram with one click.

## How It Works

1. Enter your Twitter or Instagram handle
2. AI scrapes your public profile and writes creative briefs
3. Magic Hour generates images, voices, and videos
4. Share your results or download them

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4, custom glass/neon design system |
| 3D | React Three Fiber, Three.js (particles, floating cards, cyberpunk grid) |
| Animations | GSAP ScrollTrigger, Framer Motion page transitions |
| AI Briefs | Google Gemini 2.5 Flash |
| Media Generation | [Magic Hour](https://magichour.ai) (images, memes, voice, video) |
| Scraping | fxtwitter API (Twitter), Apify (Instagram) |
| Deployment | Vercel |

## Architecture

```
Client (useReducer pipeline)
  → /api/scrape    → fxtwitter / Apify
  → /api/brief     → Gemini 2.5 Flash
  → /api/generate  → Magic Hour (image/meme/voice/video)
  → /api/poll      → Magic Hour job status
  → /api/upload    → re-upload images for video gen
```

All API routes are stateless serverless functions. The client drives the pipeline step-by-step, polling each job to completion.

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in: MAGIC_HOUR_API_KEY, GEMINI_API_KEY, APIFY_API_KEY

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MAGIC_HOUR_API_KEY` | [Magic Hour](https://magichour.ai) API key for media generation |
| `GEMINI_API_KEY` | Google Gemini API key for creative brief generation |
| `APIFY_API_KEY` | Apify API key for Instagram scraping (optional) |
| `NEXT_PUBLIC_APP_URL` | Deployed app URL (for OG meta tags) |

## Credits

- Media generation powered by [Magic Hour](https://magichour.ai)
- Creative briefs by [Google Gemini](https://ai.google.dev/)
- Profile scraping via [fxtwitter](https://github.com/FixTweet/FxTwitter) and [Apify](https://apify.com)
