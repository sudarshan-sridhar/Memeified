# Design System - Main Character Energy

## Visual Identity

### Theme: Cyberpunk Meme Universe
Dark base with neon accents. The intersection of internet culture and cinematic drama. Think: if a meme page had a movie budget.

### Color Palette
```css
:root {
  /* Base */
  --bg-primary: #0a0a0f;        /* Near-black with slight blue */
  --bg-secondary: #12121a;      /* Card backgrounds */
  --bg-tertiary: #1a1a2e;       /* Elevated surfaces */

  /* Neon Accents */
  --neon-purple: #a855f7;       /* Primary accent */
  --neon-pink: #ec4899;         /* Secondary accent */
  --neon-cyan: #06b6d4;         /* Tertiary accent */
  --neon-green: #22c55e;        /* Success / "Go" states */
  --neon-orange: #f97316;       /* Warning / fire */

  /* Glow variants (for box-shadow and text-shadow) */
  --glow-purple: 0 0 20px rgba(168, 85, 247, 0.5);
  --glow-pink: 0 0 20px rgba(236, 72, 153, 0.5);
  --glow-cyan: 0 0 20px rgba(6, 182, 212, 0.5);

  /* Text */
  --text-primary: #f8fafc;      /* White text */
  --text-secondary: #94a3b8;    /* Muted text */
  --text-accent: #a855f7;       /* Highlighted text */
}
```

### Typography
```css
/* Headings: Bold, dramatic, uppercase where appropriate */
font-family: 'Space Grotesk', 'Inter', sans-serif;

/* Body: Clean and readable */
font-family: 'Inter', sans-serif;

/* Monospace (for handles, code-like elements): */
font-family: 'JetBrains Mono', monospace;

/* Import via Google Fonts in layout.tsx */
```

### 3D Scene Specifications

#### Landing Page Scene
- **Background:** Deep space / void with subtle fog
- **Grid floor:** Cyberpunk-style perspective grid (neon purple lines, fading into distance)
- **Floating elements:**
  - 3-5 meme card meshes (PlaneGeometry with rounded corners, meme textures)
  - Social media icons (custom geometries or imported .glb models)
  - Particle system: 200-500 small glowing dots (mix of purple, pink, cyan)
- **Lighting:**
  - Ambient light (low intensity, 0.3)
  - Point lights in neon colors (purple, pink, cyan) positioned around the scene
  - Rim lighting on key objects
- **Camera:**
  - Default: slightly elevated, looking slightly down
  - Mouse movement: subtle parallax (camera follows mouse with lerp, max 5 degrees)
  - Scroll: camera pushes forward through the scene as user scrolls

#### Loading Scene
- **Central element:** Abstract humanoid wireframe being "built" particle by particle
- **Orbiting elements:** Small icons representing each feature being generated
- **Pulse effect:** Rings expanding outward from center on each progress step

#### Result Page Scene
- **Celebratory particles:** Confetti-like particles falling with physics
- **Background:** Same dark theme but with warm accent lighting
- **Content cards float with subtle bob animation**

### Animation Guidelines

#### GSAP Scroll Triggers
```javascript
// Section reveals
gsap.from(".section", {
  scrollTrigger: { trigger: ".section", start: "top 80%" },
  y: 100, opacity: 0, duration: 1, ease: "power3.out"
});

// Staggered card reveals
gsap.from(".feature-card", {
  scrollTrigger: { trigger: ".features", start: "top 70%" },
  y: 60, opacity: 0, stagger: 0.15, duration: 0.8
});
```

#### Framer Motion (UI Elements)
```javascript
// Page transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20 }
};

// Button hover
const buttonHover = {
  scale: 1.05,
  boxShadow: "0 0 30px rgba(168, 85, 247, 0.6)"
};
```

#### Three.js Animations
```javascript
// Floating bob effect
useFrame((state) => {
  mesh.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
  mesh.current.rotation.y += 0.005;
});

// Mouse parallax
useFrame(({ mouse }) => {
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 2, 0.05);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 1, 0.05);
});
```

### Component Styling Patterns

#### Glass Card
```css
.glass-card {
  background: rgba(18, 18, 26, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.glass-card:hover {
  border-color: rgba(168, 85, 247, 0.5);
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.15);
}
```

#### Neon Button
```css
.neon-button {
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-pink));
  border: none;
  border-radius: 12px;
  padding: 14px 32px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: var(--glow-purple);
  transition: all 0.3s ease;
}

.neon-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 40px rgba(168, 85, 247, 0.7);
}
```

#### Input Field
```css
.handle-input {
  background: var(--bg-secondary);
  border: 2px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
}

.handle-input:focus {
  border-color: var(--neon-purple);
  box-shadow: var(--glow-purple);
  outline: none;
}
```

### Mobile Responsiveness

- **3D scenes:** Reduce particle count by 50%, simplify geometry, lower resolution
- **On devices with no WebGL support:** Fall back to 2D animated gradient background
- **Touch interactions:** Replace mouse parallax with device orientation (gyroscope) or remove
- **Layout:** Stack feature cards vertically, full-width video players
- **Breakpoints:** 640px (sm), 768px (md), 1024px (lg), 1280px (xl)

### Accessibility
- All interactive elements keyboard accessible
- Color contrast ratio > 4.5:1 for text
- Reduced motion media query: disable GSAP/Three.js animations, use simple fades
- Alt text on all generated images
- Screen reader labels on share buttons
