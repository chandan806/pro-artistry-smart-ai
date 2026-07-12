# Nova — AI Creative Platform

Premium AI-powered creative studio: AI Chat, Image Generator, Photo Editor, Video Generator, Graphic Designer, and Templates. Built with **TanStack Start** (React 19 + Vite 7), **Tailwind CSS v4**, and **Lovable Cloud** (Supabase auth + database) with the **Lovable AI Gateway** for all AI features.

## Tech stack

- TanStack Start v1 (SSR, file-based routing under `src/routes/`)
- React 19 + TypeScript (strict)
- Tailwind CSS v4 via `src/styles.css`
- Supabase auth (email/password + Google OAuth)
- Lovable AI Gateway (chat streaming + image generation)

## Local development

```bash
bun install
cp .env.example .env   # fill in values
bun dev                # http://localhost:8080
```

## Environment

See `.env.example`. On Lovable, secrets are injected automatically. For self-hosting, fill each variable in your host's env settings.

- `LOVABLE_API_KEY` — server-only, powers `/api/chat` and `/api/generate-image`
- `SUPABASE_*` / `VITE_SUPABASE_*` — Lovable Cloud (Supabase) URL + publishable key

## Project structure

```
src/
  routes/              # File-based routes (TanStack Start)
    __root.tsx         # Root layout + <head> metadata
    index.tsx          # Landing page
    auth.tsx           # Sign in / sign up
    app.tsx            # Studio shell (sidebar + outlet)
    app.chat.tsx       # AI Chat (streaming)
    app.image.tsx      # AI Image Generator
    app.edit.tsx       # AI Photo Editor
    app.video.tsx      # AI Video (multi-frame storyboard)
    app.design.tsx     # AI Graphic Designer
    app.templates.tsx  # Template library
    api/               # Server routes
      chat.ts          # POST /api/chat (streamText)
      generate-image.ts# POST /api/generate-image
  integrations/supabase # Auto-generated Supabase client + middleware
  lib/ai-gateway.server.ts
  hooks/use-session.ts
  styles.css           # Tailwind v4 + theme tokens
```

## Deployment

- **Lovable (recommended):** click Publish in the editor.
- **Cloudflare Workers / Netlify / Vercel:** standard TanStack Start build. Run `bun run build`, then deploy the output per your host's Node/Edge adapter. Set every variable from `.env.example` in the host's env settings.

## GitHub sync

This repo is kept in two-way sync with Lovable via the Lovable GitHub App. Pushes here appear in the Lovable editor and vice-versa.
