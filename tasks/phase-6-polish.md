# Phase 6: Polish

## Goal
Optimize performance, ensure mobile works, handle edge cases, deploy, and prepare the submission.

---

## Step 1: Performance Optimization

### Code Splitting
- Dynamic import all Three.js components with `next/dynamic` and `ssr: false`
- Lazy load feature-specific components on their pages
- Split large dependencies (Three.js, GSAP) into separate chunks

### Three.js Optimization
- Use `drei`'s `useGLTF` with `preload` for any 3D models
- Compress textures (use WebP or KTX2 format)
- Reduce particle count on mobile (detect via `navigator.hardwareConcurrency` or viewport width)
- Use `frameloop="demand"` on Canvas if scene doesn't need constant updates
- Dispose geometries and materials properly in cleanup

### Image Optimization
- Use `next/image` for all static images with proper sizing
- Generated output images: display at appropriate resolution, not full size
- Lazy load images below the fold

### API Route Optimization
- Cache Claude API responses per handle (same handle = same briefs)
- Don't re-scrape if handle was scraped recently (1-hour cache)
- Batch Magic Hour status polling (one timer, multiple jobs)

---

## Step 2: Mobile Responsiveness

### Layout
- Landing page: stack sections vertically, full-width cards
- Feature cards: horizontal scroll or single column
- Create page: full-width form, larger touch targets (min 44px)
- Result page: full-width video player, single-column meme grid
- Share bar: wrap to two rows if needed

### 3D Scene on Mobile
- Detect mobile via viewport width or `navigator.userAgent`
- Mobile 3D: reduce particle count to 100, simplify geometry
- Very low-end devices: fall back to animated gradient CSS background
- Disable mouse parallax, use simple auto-rotation instead

### Touch Interactions
- Swipe between feature tabs on result page
- Tap to play/pause videos
- Long press on memes to open share menu (where supported)

### Testing
- Test on Chrome mobile viewport simulator (iPhone SE, iPhone 14, Pixel 7)
- Test actual share flows on mobile (Web Share API, download prompts)

---

## Step 3: Error States & Edge Cases

### User Input
- Empty handle: disable submit button, show hint
- Handle with special characters: strip and validate
- Handle too long: truncate with warning

### Scraping Errors
- Private account: "This account is private. Try a public account or switch platforms."
- Account not found: "We couldn't find @handle on [platform]. Double-check the username."
- Rate limited: "We're getting a lot of requests. Try again in a minute."
- Network error: "Something went wrong. Check your connection and try again."

### Generation Errors
- Magic Hour API error: "One of our AI tools hit a snag. Retrying..." (auto-retry once)
- Claude API error: fall back to template-based prompts
- Timeout: "This is taking longer than usual. You can wait or try again."
- Partial failure: show completed outputs, note which features failed, offer retry for failed ones

### UI States
- Every button that triggers an async action needs: default, loading, success, error states
- Loading states should be fun (not just a spinner): use relevant emoji or animated text
- Error toasts should auto-dismiss after 5 seconds
- Success toasts should auto-dismiss after 3 seconds

---

## Step 4: Final Visual Polish

### Animations to add/refine
- Page transition: fade + slide (Framer Motion AnimatePresence)
- Button press: scale down briefly (0.95) then spring back
- Card hover: subtle lift + glow intensify
- Share success: confetti burst (small, 1 second)
- Profile reveal: typewriter effect on name, fade on bio
- Loading steps: checkmark animation when step completes

### Typography
- Ensure all headings use Space Grotesk
- Ensure all body text uses Inter
- Ensure all code/handles use JetBrains Mono
- Check font sizes are readable on mobile (min 14px body)

### Color Consistency
- Verify all neon accents match the design system
- Ensure sufficient contrast on all text
- Dark mode only (no light mode needed for hackathon)

---

## Step 5: Deploy to Vercel

```bash
# From project root
vercel --prod
```

### Pre-deploy checklist
- [ ] All environment variables set in Vercel dashboard
- [ ] `vercel.json` has `maxDuration: 60` for API routes
- [ ] No hardcoded localhost URLs (use `NEXT_PUBLIC_APP_URL`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors (or at least none blocking build)

### Post-deploy verification
- [ ] Landing page loads on deployed URL
- [ ] Full flow works: enter handle -> generate -> view results -> share
- [ ] Shared link works in incognito (non-authenticated view)
- [ ] OG meta tags render correctly (use https://opengraph.xyz to test)

---

## Step 6: Prepare Submission

### GitHub Repo
- Clean README.md with:
  - Project name and one-line description
  - Screenshot/GIF of the app in action
  - Features list
  - Tech stack
  - How to run locally
  - Environment variables needed
  - Link to live demo
  - Credits (Magic Hour API, team members)
- Remove any sensitive data from git history
- Add `.env.example` with placeholder values
- Ensure repo is public

### Demo Video (2-3 minutes)
Script outline:
1. **(0:00-0:15)** Hook: show the final result first (an anime intro or trailer playing)
2. **(0:15-0:30)** Intro: "This is Main Character Energy -- drop your social handle, get your AI remix"
3. **(0:30-1:00)** Live demo: enter a handle, show generation in progress, reveal results
4. **(1:00-1:30)** Feature walkthrough: quick cuts of each feature output (anime, trailer, roast, memes)
5. **(1:30-2:00)** Shareability: show sharing to Twitter, the shared link opening, "Make Yours" CTA
6. **(2:00-2:30)** Tech: quick mention of Magic Hour API endpoints used, Claude for prompts, Three.js for 3D
7. **(2:30-2:45)** User acquisition: "Every share is a funnel back to Magic Hour"
8. **(2:45-3:00)** Close: "Main Character Energy -- because everyone deserves an anime intro"

Record with: OBS, Loom, or QuickTime
Edit with: iMovie, DaVinci Resolve, or CapCut

### Submission Checklist
- [ ] Live demo URL (Vercel deployment)
- [ ] GitHub repo URL (public, clean README)
- [ ] Demo video (2-3 minutes, uploaded to YouTube/Loom/Google Drive)
- [ ] Team members listed (max 4)

---

## Step 7: Final Verify

Run through the entire user journey one more time:
- [ ] Land on homepage -- 3D scene loads, animations play
- [ ] Click "Enter Your Handle" -- navigates to /create
- [ ] Enter a real Twitter handle -- scrapes successfully
- [ ] Select features -- all toggles work, trailer genre picker works
- [ ] Click Generate -- redirects to loading page
- [ ] Loading page shows real-time progress
- [ ] Results page shows all outputs
- [ ] Share to Twitter -- opens tweet composer with correct content
- [ ] Copy link -- copies correct URL
- [ ] Open shared link in incognito -- shows content + "Make Yours" CTA
- [ ] "Powered by Magic Hour" badge links correctly
- [ ] Entire flow works on mobile
- [ ] No console errors anywhere
