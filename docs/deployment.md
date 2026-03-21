# Deployment Guide

## Vercel Deployment

### Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Production deploy
vercel --prod
```

### Environment Variables
Set these in Vercel Dashboard > Project > Settings > Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `MAGIC_HOUR_API_KEY` | Your Magic Hour API key | Production, Preview |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Production, Preview |
| `APIFY_API_KEY` | Your Apify API key | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Production |

### Vercel Configuration (`vercel.json`)
```json
{
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

The `maxDuration: 60` is critical because Magic Hour generation + polling can take 30-60 seconds.

### Build Optimization
- Three.js models should go in `/public/models/` and be loaded dynamically
- Use `next/dynamic` for Three.js components to avoid SSR issues
- Enable SWC minification (default in Next.js 14+)

### Domain Setup (Optional)
1. Go to Vercel Dashboard > Project > Settings > Domains
2. Add custom domain or use the `.vercel.app` subdomain
3. Update `NEXT_PUBLIC_APP_URL` to match

### Post-Deploy Checklist
- [ ] All environment variables are set
- [ ] API routes respond correctly (`/api/scrape`, `/api/generate`, `/api/status/[id]`)
- [ ] 3D scene loads on landing page
- [ ] Social scraping works for both Twitter and Instagram
- [ ] Generation pipeline completes for at least one feature
- [ ] Share links work (open in new tab, show result)
- [ ] Mobile layout is functional
- [ ] No console errors in production
