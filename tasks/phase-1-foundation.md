# Phase 1: Foundation

## Goal
Set up the project, install all dependencies, and build the immersive 3D landing page that sets the tone for the entire app.

---

## Step 1: Project Initialization

```bash
npx create-next-app@latest falcon-hacks --typescript --tailwind --eslint --app --src-dir
cd falcon-hacks
```

### Dependencies to Install
```bash
# 3D
npm install three @react-three/fiber @react-three/drei @types/three

# Animation
npm install gsap @gsap/react framer-motion

# Utilities
npm install clsx tailwind-merge

# API clients (for later phases, install now)
npm install magic-hour apify-client @anthropic-ai/sdk

# Fonts
# Add Google Fonts via next/font in layout.tsx: Space Grotesk, Inter, JetBrains Mono
```

### Tailwind Config
Extend with the design system colors from `docs/design-system.md`. Add custom animations for pulse, float, glow effects.

---

## Step 2: App Layout

### `src/app/layout.tsx`
- Dark background (`#0a0a0f`)
- Font imports (Space Grotesk for headings, Inter for body, JetBrains Mono for code)
- Global metadata: title "Main Character Energy", description for social sharing
- OG image meta tags for when people share the app link

### `src/app/globals.css`
- CSS variables from design system
- Glass card utility classes
- Neon button styles
- Glow animation keyframes

---

## Step 3: Page Routing

Create these page files (empty shells first, fill in next steps):
- `src/app/page.tsx` -- Landing page
- `src/app/create/page.tsx` -- Input page
- `src/app/loading/[id]/page.tsx` -- Loading/progress page
- `src/app/result/[id]/page.tsx` -- Result/share page

---

## Step 4: 3D Landing Page

This is the most important visual piece. Reference the three websites for inspiration:
- henryheffernan.com: Mouse-reactive 3D objects, smooth transitions
- anniversary.bonhommeparis.com: Scroll-driven storytelling, particle effects
- 2019.bruno-simon.com: Playful 3D world, physics interactions

### 4a: Three.js Scene Setup

Create `src/components/three/Scene.tsx`:
- Canvas wrapper with R3F
- Use `@react-three/drei` for helpers (OrbitControls, Environment, etc.)
- Dynamic import with `ssr: false` (Three.js cannot run on server)

```tsx
// src/components/three/Scene.tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

export default function Scene({ children }) {
  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 60 }}
      style={{ position: "fixed", top: 0, left: 0, zIndex: 0 }}
    >
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </Canvas>
  );
}
```

### 4b: Particle Field

Create `src/components/three/ParticleField.tsx`:
- 300-500 particles using Points geometry
- Mix of purple, pink, cyan colors
- Gentle floating animation (sine wave on Y axis)
- Subtle mouse reactivity (particles drift toward cursor)

### 4c: Floating Meme Cards

Create `src/components/three/MemeCard3D.tsx`:
- PlaneGeometry with rounded corners (use shape geometry or drei's RoundedBox)
- Load meme textures as materials
- Float animation (sin/cos on position)
- Mouse parallax (tilt toward cursor)
- 3-5 cards scattered in the scene at different depths

### 4d: Cyberpunk Grid Floor

Create `src/components/three/CyberpunkGrid.tsx`:
- GridHelper or custom line geometry
- Neon purple lines
- Perspective vanishing point effect
- Optional: animate lines scrolling forward

### 4e: Camera Controller

Create `src/components/three/CameraController.tsx`:
- Mouse-driven subtle camera movement (lerp toward mouse position)
- Scroll-driven camera push (moves forward as user scrolls)
- Smooth transitions between states

---

## Step 5: Landing Page Sections (HTML/CSS over 3D)

The 3D scene is the fixed background. HTML content scrolls over it with transparent/glass backgrounds.

### Section 1: Hero
- Big title: "MAIN CHARACTER ENERGY" (glitch text effect or neon glow)
- Subtitle: "Drop your handle. Get your anime intro, fake trailer, roast video, and meme pack."
- CTA button: "Enter Your Handle" -> /create
- GSAP entrance animation: title slides up, subtitle fades in, button pulses

### Section 2: Feature Cards
- 4 glass cards in a 2x2 grid (or horizontal scroll on mobile)
- Each card: icon/preview image, feature name, 1-line description
  1. Anime Intro -- "Your origin story, anime style"
  2. Fake Trailer -- "You're the main character"
  3. Roast Video -- "AI doesn't hold back"
  4. Meme Pack -- "Your life in 4 memes"
- GSAP stagger animation on scroll reveal
- 3D tilt effect on hover (CSS transform or R3F)

### Section 3: How It Works
- 3 steps with icons/animations:
  1. "Drop your @ handle" (input icon)
  2. "AI does its thing" (magic wand / sparkle icon)
  3. "Share your results" (share icon)
- GSAP scroll-triggered step-by-step reveal

### Section 4: CTA Footer
- "Ready to find out who you really are?"
- Big "DROP YOUR HANDLE" button -> /create
- Small "Powered by Magic Hour" badge

---

## Step 6: Verify

- [ ] `npm run dev` starts without errors
- [ ] Landing page loads in < 3 seconds
- [ ] 3D scene renders with particles, floating cards, grid
- [ ] Mouse movement affects camera/objects
- [ ] Scroll triggers section animations
- [ ] All 4 page routes are accessible
- [ ] Responsive on mobile (3D degrades gracefully)
- [ ] No console errors
