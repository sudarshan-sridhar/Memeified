# Phase 2: Social Scraper

## Goal
Build the social media scraping layer and the input UI where users enter their handle and select features.

---

## Step 1: Scraper Service

Create `src/lib/scraper.ts`:

### Twitter/X Scraping
Option A (Apify -- recommended):
```typescript
import { ApifyClient } from "apify-client";

export async function scrapeTwitter(handle: string): Promise<ProfileData> {
  const client = new ApifyClient({ token: process.env.APIFY_API_KEY });
  // Use a Twitter profile scraper actor
  // Extract: name, bio, profile_pic, recent tweets, follower/following counts
  // Normalize to ProfileData interface
}
```

Option B (Direct -- fallback):
- Fetch `https://syndication.twitter.com/srv/timeline-profile/screen-name/{handle}` or similar public endpoint
- Parse the HTML/JSON response
- Note: Twitter/X frequently changes their public APIs, so Apify is more reliable

### Instagram Scraping
Option A (Apify -- recommended):
```typescript
export async function scrapeInstagram(handle: string): Promise<ProfileData> {
  const client = new ApifyClient({ token: process.env.APIFY_API_KEY });
  // Use Instagram profile scraper actor
  // Extract: name, bio, profile_pic, recent captions, follower/following counts
  // Normalize to ProfileData interface
}
```

Option B (Direct -- fallback):
- Fetch `https://www.instagram.com/api/v1/users/web_profile_info/?username={handle}`
- Requires session cookies which is fragile

### ProfileData Interface
```typescript
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
```

### Error Handling
- Private account: throw `PrivateAccountError` with user-friendly message
- Account not found: throw `AccountNotFoundError`
- Rate limited: throw `RateLimitError` with retry suggestion
- No posts: return profile with empty `recent_posts` array (still usable)

---

## Step 2: API Route

Create `src/app/api/scrape/route.ts`:

```typescript
// POST /api/scrape
// Body: { platform: "twitter" | "instagram", handle: string }
// Response: { success: true, profile: ProfileData } | { success: false, error: string }

export async function POST(req: Request) {
  const { platform, handle } = await req.json();

  // Validate
  if (!handle || !platform) return error 400
  if (!["twitter", "instagram"].includes(platform)) return error 400

  // Clean handle (remove @ if present)
  const cleanHandle = handle.replace(/^@/, "");

  try {
    const profile = platform === "twitter"
      ? await scrapeTwitter(cleanHandle)
      : await scrapeInstagram(cleanHandle);
    return Response.json({ success: true, profile });
  } catch (e) {
    // Return appropriate error based on exception type
  }
}
```

---

## Step 3: Create Page UI

Build `src/app/create/page.tsx`:

### Layout
- 3D background continues from landing page (same Scene component)
- Centered glass card container
- Step-by-step flow within the card

### Step 1 of 2: Enter Handle
- Platform toggle: Twitter/X | Instagram (animated pill toggle)
  - Twitter icon on left, Instagram icon on right
  - Neon glow on selected option
- Handle input field
  - Prefix: "@" shown as static text
  - Placeholder: "yourhandle"
  - Monospace font (JetBrains Mono)
  - Neon border glow on focus
- "Next" button (disabled until handle entered)
- Loading state while scraping (show spinner + "Stalking your profile...")
- Error state: show message in red, allow retry

### Step 2 of 2: Select Features
- Show scraped profile preview (pfp, name, bio) -- confirms we got the right person
- Feature toggles (all on by default):
  - [ ] Anime Intro -- "Your origin story, anime style"
  - [ ] Fake Trailer -- "You're the main character"
    - If enabled, show genre picker: Marvel, DC, Disney, Pixar, Horror, Action, Sci-Fi, Other
    - Genre picker: horizontal scroll of 3D-style cards with movie poster aesthetics
  - [ ] Roast Video -- "AI doesn't hold back"
  - [ ] Meme Pack -- "Your life in memes"
- Estimated credit cost shown at bottom
- "GENERATE" button (big, neon, unmissable)
  - On click: POST to /api/generate, redirect to /loading/[session-id]

### Animations
- Page entrance: glass card slides up with fade
- Platform toggle: smooth color transition
- Profile preview: photo fades in, name types out letter by letter
- Feature toggles: satisfying toggle animation with glow
- Generate button: pulse animation while idle, loading spinner on click

---

## Step 4: Profile Picture Download

When scraping is successful, we need to download the user's profile picture and prepare it for Magic Hour upload:

```typescript
// In the scrape API route or generate route:
async function downloadProfilePic(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
```

Store the downloaded image buffer in the session for later upload to Magic Hour.

---

## Step 5: Verify

- [ ] Scraping works for a real public Twitter/X profile
- [ ] Scraping works for a real public Instagram profile
- [ ] Private accounts show clear error message
- [ ] Invalid handles show clear error message
- [ ] Create page renders with 3D background
- [ ] Platform toggle works
- [ ] Handle input validation works
- [ ] Profile preview shows correct data after scraping
- [ ] Feature selector shows all 4 options with trailer genre picker
- [ ] Generate button triggers API call and redirects
