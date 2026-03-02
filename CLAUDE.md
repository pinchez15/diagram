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

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "Is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First:** Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan:** Check in before starting implementation
3. **Track Progress:** Mark items complete as you go
4. **Explain Changes:** High-level summary at each step
5. **Document Results:** Add review section to `tasks/todo.md`
6. **Capture Lessons:** Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First:** Make every change as simple as possible. Minimal code impact.
- **No Laziness:** Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact:** Changes should only touch what's necessary. Avoid introducing bugs.

## Commit Convention

```
feat(frontend): AI diagram generation from text prompt [PRD Feature 1]
feat(backend): Clerk webhook handler for user sync
fix(ui): Node palette drag preview positioning
```

Always reference the PRD feature when applicable.
