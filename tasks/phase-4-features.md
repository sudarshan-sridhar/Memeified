# Phase 4: Core Features

## Goal
Implement all 4 features end-to-end with their specific pipelines and the loading page that shows real-time progress.

---

## Step 1: Anime Intro Feature

### Pipeline
1. Claude generates: scene_prompt, archetype, tagline, voice_script, voice_name
2. **Parallel batch 1:**
   - Magic Hour AI Image Generator: `{ prompt: scene_prompt, tool: "ai-anime-generator", model: "flux-schnell" }`
   - Magic Hour AI Voice Generator: `{ prompt: voice_script, voice_name }`
3. Poll both until complete
4. Upload completed anime image to Magic Hour storage
5. **Sequential step:**
   - Magic Hour Image-to-Video: `{ image_file_path: uploaded_anime_image, end_seconds: 5, model: "default" }`
   - Include style.prompt for camera movement: "Slow dramatic zoom in with wind effects"
6. Poll video until complete
7. Store outputs: anime image URL, voice audio URL, video URL

### Claude Prompt Guidance for Anime
The LLM should reference trending anime visual styles (2024-2026):
- Solo Leveling shadow aesthetic
- Jujutsu Kaisen domain expansion energy
- Demon Slayer breathing technique visuals
- Chainsaw Man raw gritty style
- Frieren quiet elegance

The prompt should NOT reference specific anime titles or characters. Instead, describe the visual style attributes: lighting, color palette, atmosphere, pose, and energy level.

### Output Structure
```typescript
{
  anime: {
    image_url: "https://...",    // Static anime portrait
    video_url: "https://...",    // 5s animated intro clip
    voice_url: "https://...",    // Celebrity narrator audio
    archetype: "The Silent Architect",
    tagline: "Code is his weapon. Deadlines fear him."
  }
}
```

---

## Step 2: Fake Trailer Feature

### Genre Options
Present as interactive 3D cards on the /create page:
- **Marvel** -- epic heroic, blue/red tones, explosion backgrounds
- **DC** -- dark moody, gothic architecture, rain
- **Disney** -- magical, warm colors, enchanted landscapes
- **Pixar** -- colorful, heartwarming, stylized realism
- **Horror** -- dark, foggy, unsettling, muted colors
- **Action** -- explosions, dynamic poses, high contrast
- **Sci-Fi** -- futuristic, neon, space, technology
- **Anime** -- cinematic anime style (different from the anime intro)

### Pipeline
1. User selects genre on /create page
2. Claude generates: scene_prompt (genre-specific), movie_title, tagline, voice_script, voice_name
3. **Parallel batch 1:**
   - Magic Hour AI Image Generator: cinematic poster image matching genre
   - Magic Hour AI Voice Generator: dramatic trailer narration
4. Poll both until complete
5. **(Optional) Face Swap:**
   - Upload user's profile pic
   - Upload generated poster image
   - Magic Hour Face Swap Photo: swap user's face into the hero position
   - Poll until complete
6. Upload final image (face-swapped or original) to Magic Hour
7. Magic Hour Image-to-Video: animate the poster with cinematic camera movement
8. Poll video until complete
9. Store outputs

### Claude Prompt Guidance for Trailers
- Voice script should mimic actual movie trailer pacing
- Movie title should be dramatic and related to user's actual life/bio
- Scene prompt should match genre conventions strictly
- Tagline should be punchy and quotable

### Output Structure
```typescript
{
  trailer: {
    image_url: "https://...",     // Movie poster
    video_url: "https://...",     // Animated trailer clip
    voice_url: "https://...",     // Dramatic narration
    movie_title: "THE LAST COMMIT",
    tagline: "When the codebase fights back.",
    genre: "Marvel"
  }
}
```

---

## Step 3: Roast Video Feature

### Pipeline
1. Claude receives full profile data and generates roast-specific content
2. Claude analyzes: bio cringe factor, post patterns, follower/following ratio, profile pic energy
3. Claude generates: roast_card_prompt, voice_script (the roast itself), voice_name
4. **Content safety: Claude system prompt must enforce NO jokes about race, sex, religion, or sexuality**
5. **Parallel batch 1:**
   - Magic Hour AI Image Generator: roast card image (mugshot-style, "UNDER REVIEW" stamp, dramatic)
   - Magic Hour AI Voice Generator: roast narration in comedian voice
6. Poll both until complete
7. Upload roast card to Magic Hour
8. Magic Hour Image-to-Video: animate with dramatic reveal (zoom in, flash effects)
9. Poll video until complete
10. Store outputs

### Claude Prompt Guidance for Roasts
- Focus on: bio word choices, post frequency, aesthetic choices, follower ratio
- Tone: like a comedy roast, not bullying
- Examples of safe roast angles:
  - "Bio says 'entrepreneur' but the only thing they've launched is this profile"
  - "47 followers and they still set their account to private-mode energy"
  - "Posts once a month like they're rationing WiFi"
- Strictly avoid: anything about appearance, identity, demographics

### Output Structure
```typescript
{
  roast: {
    image_url: "https://...",     // Roast card
    video_url: "https://...",     // Animated roast video
    voice_url: "https://...",     // Celebrity roast narration
  }
}
```

---

## Step 4: Meme Pack Feature

### Pipeline
1. Claude analyzes profile and generates 3-4 meme briefs
2. Each brief: { template: "known meme name", topic: "personalized topic" }
3. Fire all Magic Hour AI Meme Generator calls in parallel
4. Poll all until complete
5. Store outputs as array

### Meme Template Selection
Claude should select from well-known templates that Magic Hour's meme generator recognizes:
- Drake Hotline Bling
- Distracted Boyfriend
- This Is Fine
- Expanding Brain
- Change My Mind
- Is This a Pigeon?
- Two Buttons
- One Does Not Simply
- Surprised Pikachu
- Woman Yelling at Cat

### Content Safety
Claude system prompt MUST include:
```
For memes: NEVER generate content that references or jokes about race, ethnicity, sex, gender, religion, sexuality, disabilities, or any protected characteristics. Focus humor on: career, hobbies, social media behavior, daily life, tech struggles, relationship with coffee/sleep, procrastination, and other universal experiences.
```

### Output Structure
```typescript
{
  memes: [
    { image_url: "https://...", topic: "When you mass-apply to internships", template: "Drake Hotline Bling" },
    { image_url: "https://...", topic: "Deploying on Friday", template: "This Is Fine" },
    { image_url: "https://...", topic: "Your side project vs your thesis", template: "Distracted Boyfriend" }
  ]
}
```

---

## Step 5: Loading Page

Build `src/app/loading/[id]/page.tsx`:

### Layout
- Full-screen 3D loading scene (LoadingAvatar component)
- Central animation: abstract figure being "constructed" with particles
- Progress stepper showing current status

### Progress Steps (displayed sequentially as they happen)
1. "Stalking your profile..." (scraping)
2. "Writing your origin story..." (Claude API briefing)
3. "Generating your anime form..." (image generation)
4. "Recording the narration..." (voice generation)
5. "Crafting your memes..." (meme generation)
6. "Rendering your cinematic moment..." (video generation)
7. "Your moment is ready!" (complete -> auto-redirect to /result/[id])

### Implementation
- Poll `/api/status/[id]` every 2 seconds
- Update progress bar and step text based on response
- Show outputs as they become available (progressive reveal)
- When `status === "complete"`, redirect to `/result/[id]`
- If `status === "error"`, show error with retry button

### Fun Loading Messages (rotate during wait)
- "Teaching AI to appreciate your aesthetic..."
- "Consulting the meme council..."
- "Your anime transformation is buffering..."
- "Calculating your main character score..."
- "Downloading your protagonist energy..."

---

## Step 6: Verify

For each feature, verify:
- [ ] Anime: image generates, voice generates, video generates, all URLs valid
- [ ] Trailer: genre selection works, poster generates, narration generates, video works
- [ ] Roast: roast script is funny but safe, card generates, voice works, video works
- [ ] Memes: 3-4 memes generate, all are personalized, none violate content policy
- [ ] Loading page: progress updates in real-time, redirects on complete
- [ ] All outputs are accessible via their URLs
- [ ] Total generation time is under 60 seconds (ideally under 30 for memes-only)
