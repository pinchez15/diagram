# Diagram

AI-powered workflow diagramming tool for small businesses. Built with Next.js, React Flow, Clerk (auth + billing), and Supabase (data).

## Before Writing Any Code

Read the docs relevant to your task. This is mandatory — see Philosophy.md for why.

### Product docs (read first):
- `docs/PRD.md` — Product requirements, features, data model, MVP scope
- `docs/Vision.md` — Product vision, readability standard, long-term direction
- `docs/Philosophy.md` — Agent coordination rules, ownership boundaries, test/commit cycle

### Architecture docs (read the one for your domain):
- `docs/Frontend.md` — Next.js app, React Flow canvas, Zustand state, directory structure
- `docs/Backend.md` — Supabase schema, API routes, Clerk webhooks, auth architecture
- `docs/UI.md` — Notion-minimal design system, component specs, canvas UI

### Skills (reference implementations — read before implementing):
- `docs/skills/Clerk.md` — Auth & billing patterns, proxy.ts setup, webhook implementation
- `docs/skills/ReactFlow.md` — Canvas patterns, custom nodes, performance rules
- `docs/skills/Supabase.md` — Data layer patterns, query patterns, migrations
- `docs/skills/DiagramSchema.md` — Shared schema contract, Zod validation, AI prompt fragment

## Tech Stack

- **Framework:** Next.js 14+ (App Router), TypeScript strict mode
- **Canvas:** React Flow (@xyflow/react)
- **Auth & Billing:** Clerk (@clerk/nextjs) — Stripe behind Clerk's wall
- **Database:** Supabase (PostgreSQL) — data only, NOT auth
- **State:** Zustand (canvas), Clerk hooks (auth/user)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (production deploy from main, no local dev)

## Critical Rules

### Clerk
- Middleware file is `proxy.ts` (NOT `middleware.ts`) — uses `clerkMiddleware()` from `@clerk/nextjs/server`
- Never use deprecated `authMiddleware()` — it's been replaced
- `auth()` is async — always use `await auth()`
- Import server helpers from `@clerk/nextjs/server`, components from `@clerk/nextjs`
- Never call Stripe directly — all billing through Clerk
- Never write real API keys into tracked files — placeholders only

### Supabase
- Data layer only — Clerk handles auth
- Auto RLS is enabled — all tables have RLS by default
- Use service role key on server side, scope queries with Clerk user ID
- Profiles table is synced from Clerk via webhook — Clerk is source of truth for identity

### React Flow
- Always `memo()` wrap custom node and edge components
- Use Zustand with selectors — never subscribe to full store
- Import from `@xyflow/react` (not the old `reactflow` package)

### DiagramSchema
- Changes to the shared schema affect all three layers (Frontend, Backend, UI)
- Always validate with Zod before trusting data from AI or imports
- See `docs/skills/DiagramSchema.md` for the full type definition

## Agent Coordination

See `docs/Philosophy.md` for the full coordination protocol. Key points:

- **Frontend Agent** owns: `src/app/`, `src/features/`, `src/stores/`, `src/lib/`
- **Backend Agent** owns: `src/app/api/`, Supabase schema/migrations, env config
- **UI Agent** owns: `src/components/`, design tokens, Tailwind config, global styles
- **Shared territory** (`src/types/`, `src/lib/schema/`): any agent can propose changes, must update all consumers
- **Checker Agent** reviews work against PRD.md and Vision.md before commits

## Deployment

- **No local dev.** We deploy straight to production on Vercel.
- Vercel auto-deploys from `main` branch.
- Clerk webhooks hit the production URL (`/api/webhooks/clerk`).
- Supabase project is production — migrations via `supabase db push`.

## Commit Convention

```
feat(frontend): AI diagram generation from text prompt [PRD Feature 1]
feat(backend): Clerk webhook handler for user sync
fix(ui): Node palette drag preview positioning
```

Always reference the PRD feature when applicable.
