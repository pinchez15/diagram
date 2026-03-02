# Diagram — Backend Architecture

## Overview

The Diagram backend is a combination of Supabase (Postgres, Storage, Realtime), Clerk (Auth, Billing), and Next.js API routes. Clerk handles authentication and billing (with Stripe behind Clerk's wall). Supabase handles data persistence and file storage. Next.js API routes handle AI generation, server-side export rendering, and Clerk webhook processing. Everything deploys on Vercel.

---

## Tech Stack

| Concern | Technology |
|---------|-----------|
| Database | Supabase (PostgreSQL 15+) |
| Auth | Clerk (email, Google OAuth, GitHub OAuth) |
| Billing | Clerk Billing (Stripe behind Clerk's wall) |
| Trial Management | Clerk built-in trial tooling (14-day) |
| File Storage | Supabase Storage (diagram thumbnails, exported files) |
| Realtime | Supabase Realtime (V2 — collaboration) |
| API Layer | Next.js API Routes (App Router `route.ts` handlers) |
| AI — Primary | Anthropic Claude API (claude-sonnet-4-20250514) |
| AI — Secondary | OpenAI API (gpt-4o) — user-configurable |
| Export Rendering | Puppeteer / Playwright (server-side PDF/PNG/SVG) |
| Hosting | Vercel (serverless functions, edge middleware) |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                    Vercel                         │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Next.js App  │  │   API Routes (serverless) │  │
│  │  (SSR/CSR)    │  │   /api/ai/generate        │  │
│  │               │  │   /api/ai/suggest          │  │
│  │               │  │   /api/export/[format]     │  │
│  │               │  │   /api/webhooks/clerk      │  │
│  └──────┬───────┘  └──────────┬───────────────┘  │
│         │                      │                   │
└─────────┼──────────────────────┼───────────────────┘
          │                      │
     ┌────┴────┐                 │
     ▼         ▼                 ▼
┌─────────┐ ┌─────────┐  ┌─────────────────┐
│  Clerk   │ │Supabase │  │  External APIs   │
│ ┌──────┐ │ │┌──────┐ │  │  ┌───────────┐  │
│ │ Auth  │ │ ││Postgres│ │  │  │ Claude API │  │
│ ├──────┤ │ │├──────┤ │  │  └───────────┘  │
│ │Billing│ │ ││Storage│ │  │  ┌───────────┐  │
│ │(Stripe│ │ │├──────┤ │  │  │ OpenAI API │  │
│ │behind)│ │ ││Realtime│ │  │  └───────────┘  │
│ ├──────┤ │ ││(V2)   │ │  │                  │
│ │Trial  │ │ │└──────┘ │  │                  │
│ └──────┘ │ └─────────┘  └─────────────────┘
└─────────┘
```

---

## Database Schema

See PRD.md for the full SQL schema. Key tables:

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles synced from Clerk via webhook |
| `teams` | Team/workspace entities |
| `team_members` | Team membership with roles |
| `diagrams` | Diagram metadata + `canvas_data` (JSONB) |
| `diagram_versions` | Auto-save version history |
| `tool_categories` | Color-coding categories for tool/service nodes |
| `usage` | Monthly usage tracking for plan limits |

### Row Level Security (RLS)

Every table has RLS enabled. Policies follow these rules:

- **profiles:** Users can read/update their own profile. Team members can read profiles of people on their team.
- **diagrams:** Owner can CRUD. Team members can read/write if `team_id` matches. No public access by default.
- **diagram_versions:** Same as diagrams (inherit access through `diagram_id`).
- **teams / team_members:** Owners and admins can manage. Members can read.
- **tool_categories:** All authenticated users can read. Only system seed data — no user writes.
- **usage:** Users can read their own. System functions update counts.

### Database Functions

```sql
-- Increment usage counters (called from API routes via supabase.rpc)
create function increment_diagram_count(p_user_id uuid)
returns void as $$
  insert into usage (user_id, month, diagram_count)
  values (p_user_id, date_trunc('month', now())::date, 1)
  on conflict (user_id, month)
  do update set diagram_count = usage.diagram_count + 1;
$$ language sql security definer;

create function increment_ai_count(p_user_id uuid)
returns void as $$
  insert into usage (user_id, month, ai_generation_count)
  values (p_user_id, date_trunc('month', now())::date, 1)
  on conflict (user_id, month)
  do update set ai_generation_count = usage.ai_generation_count + 1;
$$ language sql security definer;

-- Check if user is within plan limits
create function check_usage_limit(p_user_id uuid, p_type text)
returns boolean as $$
  -- Returns true if within limits, false if exceeded
  -- Logic checks user's plan limits against current month usage
$$ language sql security definer;
```

---

## API Routes

### POST `/api/ai/generate`

Accepts a user prompt (or uploaded file content) and returns a Diagram-schema JSON object.

**Flow:**
1. Authenticate request (Clerk session via `auth()` helper)
2. Check usage limits (`check_usage_limit`)
3. Build LLM system prompt with Diagram schema definition
4. Call Claude API (or OpenAI, based on user preference)
5. Parse and validate LLM response against DiagramSchema (Zod)
6. Increment AI usage counter
7. Return validated schema JSON

**System prompt strategy:**
- System prompt defines the exact JSON output schema (nodes, edges, lanes, metadata)
- Includes examples of each diagram type (orgchart, workflow, swimlane)
- Constrains node types to valid enum values
- Requests position hints for layout (relative positioning, not absolute pixels)
- Instructs the model to use tool/service naming with category classification

**Error handling:**
- LLM returns invalid JSON → retry once with stricter prompt, then return error with raw output for debugging
- LLM times out → return timeout error, don't charge usage
- Rate limited → queue with exponential backoff

### POST `/api/ai/suggest`

Contextual AI suggestions within the editor (right-click → "Add steps between these nodes").

**Flow:**
1. Authenticate
2. Receive partial diagram context (selected nodes, surrounding topology)
3. Build prompt asking for suggested additions
4. Return suggested nodes/edges to insert

### GET `/api/export/[format]`

Server-side rendering for PNG, SVG, and PDF exports.

**Flow:**
1. Authenticate
2. Load diagram `canvas_data` from Supabase
3. Render React Flow canvas in headless browser (Puppeteer)
4. Capture as PNG/SVG/PDF based on format param
5. Return file or upload to Supabase Storage and return URL

**Formats:**
- `png` — High-res screenshot, 2x pixel density
- `svg` — Rendered SVG from React Flow
- `pdf` — PDF with optional title page (diagram title, description, date)
- `json` — Direct return of `canvas_data` (no rendering needed)
- `mermaid` — Convert DiagramSchema → Mermaid syntax

### POST `/api/webhooks/clerk`

Handles Clerk webhook events for user sync, billing, and trial management. Clerk manages Stripe internally — we never interact with Stripe directly.

**Events handled:**
- `user.created` → Create `profiles` row with Clerk user ID
- `user.updated` → Sync profile changes (name, avatar, email)
- `user.deleted` → Soft-delete or archive user data
- `subscription.created` → Set plan in `profiles`, record billing start
- `subscription.updated` → Sync plan changes (upgrade/downgrade)
- `subscription.deleted` → Downgrade to expired state, enforce limits
- `session.created` → (optional) Track active sessions for analytics

**Trial management:**
- Clerk's built-in trial tooling handles the 14-day free trial lifecycle
- Trial status is available via `user.publicMetadata` or Clerk's subscription API
- When trial expires, Clerk prompts the user to subscribe — we read the resulting subscription status and enforce limits accordingly
- No custom trial logic needed on our side

---

## Auth Architecture

Clerk handles all authentication. Clerk's Next.js SDK (`@clerk/nextjs`) provides middleware, server helpers, and React components out of the box.

**Supported providers (MVP):**
- Email + password
- Google OAuth
- GitHub OAuth

**Session management:**
- Clerk manages sessions via its own JWT infrastructure
- `clerkMiddleware()` in `proxy.ts` validates sessions on every request
- Server-side API routes use `auth()` to get the current user's Clerk ID
- Client-side uses `useAuth()` and `useUser()` hooks from `@clerk/nextjs`
- Clerk ↔ Supabase bridge: API routes create a Supabase client authenticated with the Clerk user ID (using Supabase's service role key, with RLS filtering on `profiles.clerk_user_id`)

**Auth proxy (`proxy.ts`):**
```
Request → clerkMiddleware() [in proxy.ts]
  → Authenticated: attach Clerk session, continue to route
  → Unauthenticated + protected route: redirect to Clerk sign-in
  → Public routes (/, /sign-in, /sign-up): always allow
```

**Clerk ↔ Supabase data bridge:**
- Clerk owns user identity (auth, profile, billing, trial status)
- Supabase owns application data (diagrams, versions, usage)
- The `profiles` table is synced from Clerk via webhook (`user.created`, `user.updated`)
- API routes look up the Clerk user ID to query Supabase with the correct RLS context
- Plan/trial status is read from Clerk's subscription API, NOT stored redundantly in Supabase (single source of truth)

**Billing architecture:**
- Clerk Billing wraps Stripe — our Stripe secret key is configured inside Clerk's dashboard
- We never call the Stripe API directly. All billing operations go through Clerk:
  - Checkout → Clerk's `<Pricing />` component or Clerk billing portal
  - Plan changes → Clerk's subscription management UI
  - Invoices → Clerk billing portal
  - Cancellation → Clerk billing portal
- Clerk fires webhook events (`subscription.created`, `subscription.updated`, `subscription.deleted`) that we handle in `/api/webhooks/clerk`

---

## Environment Variables

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=                    # Server-side only, never exposed to client
CLERK_WEBHOOK_SECRET=                # For verifying Clerk webhook signatures

# Supabase (data only — no auth)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=           # Server-side only, for admin operations

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=

# Note: Stripe keys are configured INSIDE Clerk's dashboard, not in our env.
# We never interact with Stripe directly.
```

---

## Responsibilities & Boundaries

**Backend owns:**
- Database schema, migrations, and RLS policies
- Clerk configuration (auth providers, billing plans, trial settings)
- Clerk ↔ Supabase data bridge (webhook sync, user ID mapping)
- AI prompt engineering and LLM API calls
- Server-side export rendering (Puppeteer)
- Clerk webhook handling (user sync, billing events, trial lifecycle)
- Usage tracking and plan limit enforcement
- File storage (thumbnails, exports) in Supabase Storage
- Environment variable management and secrets

**Backend does NOT own:**
- Client-side state or React components (→ Frontend)
- Canvas rendering or layout algorithms (→ Frontend)
- Visual design or component styling (→ UI)
- Import parsing (Mermaid/JSON/YAML) (→ Frontend)
- Undo/redo history (→ Frontend)

---

## Deployment

- **Vercel:** Straight to production. Auto-deploy from `main` branch. No local dev environment — all development targets the production Vercel deployment.
- **Supabase:** Migrations managed via Supabase CLI (`supabase db push`). Seed data for `tool_categories`.
- **Clerk:** Auth providers, billing plans, and trial configured in Clerk Dashboard. Webhook endpoint (`/api/webhooks/clerk`) registered in Clerk Dashboard. Stripe key configured inside Clerk.

---

## Open Questions

1. What's the cost model for Puppeteer-based exports on Vercel? May need a dedicated export service.
2. Should we implement API rate limiting at the Vercel level or in the database?
3. For V2 real-time collaboration: Supabase Realtime broadcast vs. presence? Or switch to Yjs/CRDT?
4. Should we use Clerk Organizations for team management, or build our own teams table? (Current design: own teams table synced from Clerk)
