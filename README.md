# FluentForge

FluentForge is an AI-powered language-learning platform built for classrooms. It
pairs conversational practice (text and voice) with a structured, CEFR-aligned
curriculum, gamified progression, and a full teacher/student/district workflow —
including the roster management, assignments, and compliance tooling that schools
require.

> **Proprietary software.** Copyright © 2024–2025 Caleb Jaworski. All rights
> reserved. See [`LICENSE.txt`](LICENSE.txt). This repository is not open source;
> do not copy, distribute, or reuse without written permission.

## Features

- **Conversational practice** — text chat with an AI tutor plus real-time voice
  conversation (ElevenLabs / realtime audio) with pronunciation feedback.
- **Structured curriculum** — CEFR-leveled lessons, placement quiz, and a
  spaced-repetition (FSRS) vocabulary review deck.
- **Certifications** — reading, writing, and speaking certification flows with
  shareable certificates.
- **Gamification** — XP, levels, streaks, challenges, and leaderboards.
- **Classrooms** — teacher dashboard, class rosters, student assignment
  creation/grading, and progress analytics.
- **Localization** — the UI is translated into 40+ learner native languages,
  loaded on demand.
- **Compliance** — age gating, parental controls, content safety, and
  FERPA/COPPA-oriented data handling (see [`docs/`](docs/)).

## Tech stack

| Layer      | Technology                                                           |
| ---------- | -------------------------------------------------------------------- |
| Frontend   | Vite, React 18, TypeScript, React Router, TanStack Query             |
| UI         | Tailwind CSS, shadcn/ui (Radix), Framer Motion, Recharts             |
| Backend    | Supabase — Postgres, Auth, Row Level Security, Edge Functions (Deno) |
| AI / Voice | LLM-backed edge functions, ElevenLabs, browser Speech Synthesis      |

## Getting started

**Prerequisites:** Node.js 20+ and npm. (This project standardizes on npm; the
Supabase CLI is optional, only needed for backend work.)

```sh
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then fill in your Supabase values (see below)

# 3. Start the dev server (http://localhost:8080)
npm run dev
```

### Environment variables

All are read at build time and exposed to the browser, so only use the Supabase
**publishable/anon** key here — never the `service_role` key. See
[`.env.example`](.env.example).

| Variable                        | Description                    |
| ------------------------------- | ------------------------------ |
| `VITE_SUPABASE_URL`             | Your Supabase project URL      |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key  |
| `VITE_SUPABASE_PROJECT_ID`      | Supabase project ref           |

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the Vite dev server            |
| `npm run build`     | Production build                     |
| `npm run build:dev` | Development-mode build               |
| `npm run preview`   | Preview the production build locally |
| `npm run lint`      | Run ESLint                           |
| `npm run typecheck` | Type-check without emitting          |

## Project structure

```
src/
  components/     Feature and UI components (shadcn/ui in components/ui)
  pages/          Route-level pages (lazy-loaded in App.tsx)
  hooks/          Reusable React hooks (data, auth, gamification, voice…)
  contexts/       App-wide providers (localization, XP notifications)
  integrations/   Supabase client + generated database types
  translations/   Per-language UI strings (English eager, rest lazy-loaded)
  utils/          Domain logic: safety, security, TTS, proficiency, etc.
supabase/
  functions/      Deno edge functions (AI tutor, grading, voice, usage…)
  migrations/     SQL schema migrations
docs/             Compliance and security documentation
```

## Backend (Supabase)

The database schema lives in [`supabase/migrations/`](supabase/migrations) and
server logic in [`supabase/functions/`](supabase/functions). Generated TypeScript
types for the database are in `src/integrations/supabase/types.ts`; regenerate
them against your project with the Supabase CLI when the schema changes:

```sh
supabase gen types typescript --project-id <your-project-ref> > src/integrations/supabase/types.ts
```

## License

Proprietary and confidential. See [`LICENSE.txt`](LICENSE.txt) and
[`COPYRIGHT.md`](COPYRIGHT.md).
