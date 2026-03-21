# Phase 5: Shareability

## Goal
Build the result page and all sharing mechanisms. This is 25% of judging -- every output must be dead simple to share.

---

## Step 1: Result Page

Build `src/app/result/[id]/page.tsx`:

### Layout
- 3D celebratory background (confetti particles, warm neon lighting)
- User profile header: "Main Character Energy for @handle"
- Tab/section navigation for each generated feature
- Each output displayed with its own share controls
- Bottom: "Powered by Magic Hour" + "Make Yours" CTA

### Content Display

#### Anime Section
- Video player (if video generated) -- autoplay, muted, looping
- Static anime portrait below (clickable to enlarge)
- Archetype badge: "THE SILENT ARCHITECT"
- Tagline text with glow effect
- Audio player for voice narration (play button)
- Share bar for this section

#### Trailer Section
- Video player for trailer clip -- autoplay, muted, looping
- Movie poster image (clickable to enlarge)
- Movie title + tagline displayed in cinematic style
- Audio player for narration
- Share bar for this section

#### Roast Section
- Video player for roast video -- autoplay, muted
- Roast card image
- Roast text displayed with typing animation
- Audio player for roast narration
- Share bar for this section

#### Meme Grid
- 2x2 grid of generated memes
- Each meme: click to enlarge, individual share button
- "Download All" button for meme pack

---

## Step 2: Share Buttons

Create `src/lib/share.ts` and `src/components/ui/ShareBar.tsx`:

### Twitter/X Share
```typescript
export function shareToTwitter(text: string, url: string) {
  const tweetText = encodeURIComponent(text);
  const tweetUrl = encodeURIComponent(url);
  window.open(
    `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`,
    "_blank"
  );
}
```

Pre-filled tweet templates per feature:
- Anime: "AI turned me into an anime character and I'm not okay -- @magichourai made this"
- Trailer: "Apparently my life is a [genre] movie called [TITLE] -- made with @magichourai"
- Roast: "AI just violated me and I have to post it -- @magichourai"
- Memes: "AI made memes about my life and they're way too accurate -- @magichourai"

All tweets include the shareable result URL.

### Instagram Share
Instagram doesn't support direct web sharing of media. Options:
1. **Download + prompt:** "Download this image/video and share it to your Instagram Story"
2. **Deep link to Stories:** `instagram://library?AssetPath=...` (limited support)
3. **Copy to clipboard:** Copy the image/video to clipboard (where supported)

Best approach for hackathon:
- Show a "Share to Instagram" button that downloads the file and shows instructions
- On mobile: use Web Share API if available

### Copy Link
```typescript
export async function copyLink(url: string) {
  await navigator.clipboard.writeText(url);
  // Show toast: "Link copied!"
}
```

The link should be: `https://[APP_URL]/result/[session-id]`

### Download
```typescript
export function downloadFile(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
```

### Web Share API (Mobile)
```typescript
export async function nativeShare(title: string, text: string, url: string) {
  if (navigator.share) {
    await navigator.share({ title, text, url });
  } else {
    copyLink(url);  // Fallback
  }
}
```

---

## Step 3: ShareBar Component

```tsx
// src/components/ui/ShareBar.tsx
interface ShareBarProps {
  feature: string;
  resultUrl: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  customText?: string;
}

// Renders a horizontal bar with:
// [Twitter/X] [Instagram] [Copy Link] [Download]
// Each button has icon + label
// Hover: neon glow effect matching button color
// Click feedback: brief scale animation + toast notification
```

---

## Step 4: "Make Yours" CTA

This is critical for user acquisition (20% of judging).

### On the result page (for the creator):
- Prominent "Share Your Results" section
- All outputs with share buttons

### On the result page (for someone viewing a shared link):
- They see the generated content
- They see: "This was made with Main Character Energy"
- Big CTA: "MAKE YOURS" -> links to /create
- Smaller CTA: "Powered by Magic Hour -- try their tools" -> links to magichour.ai
- Social proof: "Join 500+ people who found their main character energy" (can be fake for hackathon)

### Magic Hour Attribution
- "Powered by Magic Hour" badge in footer of every result page
- Badge links to magichour.ai
- Optional: "This result used 5 Magic Hour AI tools" transparency line
- Optional: Mini showcase of other Magic Hour tools below the fold

---

## Step 5: Shareable URL That Works for Non-Users

The result page `/result/[id]` must work for ANYONE who visits it, not just the creator.

### Requirements:
- Result data must persist (not just in-memory)
- For hackathon: store results in Vercel KV or a simple JSON store
- Output URLs from Magic Hour should be permanent (or at least long-lived)
- Page should render the content without requiring auth or generation

### OG Meta Tags (for link previews on Twitter/Discord/etc.)
```tsx
export async function generateMetadata({ params }) {
  const session = await getSession(params.id);
  return {
    title: `${session.profile.display_name}'s Main Character Energy`,
    description: `AI turned @${session.profile.handle} into an anime character, made a movie trailer, roasted them, and created a meme pack.`,
    openGraph: {
      images: [session.outputs.anime?.image_url || session.outputs.memes?.[0]?.image_url],
    },
    twitter: {
      card: "summary_large_image",
    }
  };
}
```

This ensures that when someone shares the result URL on Twitter, it shows a nice preview with the anime portrait or meme.

---

## Step 6: Verify

- [ ] Result page displays all generated outputs correctly
- [ ] Video players autoplay (muted) and loop
- [ ] Twitter share opens tweet composer with correct text + URL
- [ ] Instagram share downloads the file with clear instructions
- [ ] Copy link works and copies correct URL
- [ ] Download works for images and videos
- [ ] "Make Yours" button navigates to /create
- [ ] "Powered by Magic Hour" badge links to magichour.ai
- [ ] Shared URL works when opened by someone else (non-creator)
- [ ] OG meta tags render correct previews on Twitter/Discord
- [ ] Web Share API works on mobile
- [ ] All share buttons have satisfying click feedback
