# Main Character Energy - Master Task Tracker

## Status Legend
- [ ] Not started
- [x] Complete
- [~] In progress

---

## Phase 1: Foundation
See `tasks/phase-1-foundation.md` for details.

- [ ] Initialize Next.js 14+ project with TypeScript
- [ ] Install dependencies (R3F, GSAP, Tailwind, Framer Motion)
- [ ] Set up Tailwind config with custom theme (design-system.md)
- [ ] Create app layout with dark theme and font imports
- [ ] Set up page routing structure (/, /create, /loading/[id], /result/[id])
- [ ] Build 3D landing page hero scene
- [ ] Build feature showcase section with scroll animations
- [ ] Build "How It Works" section
- [ ] Build CTA footer section
- [ ] Verify: Landing page loads in <3s, 3D scene is interactive

## Phase 2: Social Scraper
See `tasks/phase-2-scraper.md` for details.

- [ ] Set up Apify client (or build lightweight scraper)
- [ ] Build `/api/scrape` API route
- [ ] Build Twitter/X scraping logic
- [ ] Build Instagram scraping logic
- [ ] Build `/create` page UI (handle input + platform selector)
- [ ] Build feature selector UI (toggles for each feature + trailer genre picker)
- [ ] Handle edge cases (private accounts, invalid handles, no bio)
- [ ] Verify: Can scrape a real public Twitter and Instagram profile

## Phase 3: AI Pipeline
See `tasks/phase-3-pipeline.md` for details.

- [ ] Build Magic Hour API client (`lib/magic-hour.ts`)
- [ ] Implement file upload flow (upload URL -> PUT -> file_path)
- [ ] Implement polling mechanism for job completion
- [ ] Build Claude API client (`lib/claude.ts`)
- [ ] Build creative brief generation prompt
- [ ] Build `/api/generate` orchestration route
- [ ] Build `/api/status/[id]` polling route
- [ ] Build session storage (in-memory Map)
- [ ] Verify: End-to-end pipeline works for at least one feature

## Phase 4: Core Features
See `tasks/phase-4-features.md` for details.

- [ ] Anime Intro: image gen -> voice gen -> image-to-video
- [ ] Fake Trailer: genre selection -> image gen -> voice gen -> video
- [ ] Roast Video: profile analysis -> roast script -> voice + video
- [ ] Meme Pack: topic generation -> meme gen x3-4
- [ ] Build loading page with real-time progress tracking
- [ ] Verify: Each feature produces output within 60 seconds

## Phase 5: Shareability
See `tasks/phase-5-share.md` for details.

- [ ] Build result page layout with all outputs displayed
- [ ] Implement Twitter share (pre-filled tweet text + media)
- [ ] Implement Instagram share (download prompt + deep link)
- [ ] Implement copy link functionality
- [ ] Implement download button for each output
- [ ] Add "Make Yours" CTA on result pages
- [ ] Add "Powered by Magic Hour" branding
- [ ] Build shareable URL that works for non-users
- [ ] Verify: Shared link opens correctly, shows content, has CTA

## Phase 6: Polish
See `tasks/phase-6-polish.md` for details.

- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Mobile responsiveness pass
- [ ] Error states and edge case handling
- [ ] Add subtle sound effects (optional)
- [ ] Final Lighthouse audit
- [ ] Deploy to Vercel production
- [ ] Record 2-3 minute demo video
- [ ] Prepare GitHub repo (README, screenshots)
- [ ] Verify: Full flow works on mobile, desktop, and shared links

---

## Review Notes
_Add review notes here after each phase completion_

---

## Lessons Learned
_Add lessons learned here after corrections_
