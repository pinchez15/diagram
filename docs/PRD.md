# Diagram — Product Requirements Document

## Product Vision

Diagram is an AI-native workflow diagramming tool built for small businesses (~20 employees) who need to create, modify, and maintain organizational and process diagrams without enterprise tooling like Figma or Visio. The core insight: consultants can generate beautiful workflow diagrams with AI today, but deliver them in tools their clients can't use. Diagram solves both sides — fast AI-powered creation AND a cheap, intuitive editing environment the client keeps.

---

## Target User

- **Primary:** Small business owners/operators with ~20 total employees
- **Secondary:** Consultants (like CappaWork) who build diagrams for clients and need a handoff-friendly tool
- **Anti-user:** Enterprise teams with existing Lucidchart/Visio/Figma licenses

**Jobs to Be Done:**
1. "I need to understand how work flows through my company and who owns what"
2. "A consultant gave me a process diagram and I need to update it as things change"
3. "I want to document our workflows but I don't have time to learn diagramming software"

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router) |
| Backend/DB | Supabase (Postgres, Storage, Realtime) |
| Hosting | Vercel |
| Auth | Clerk (email, Google, GitHub OAuth) |
| Billing | Clerk Billing (Stripe behind Clerk's wall) |
| Trial | Clerk's 14-day free trial tooling |
| AI | Anthropic Claude API + OpenAI API (user-configurable) |
| Diagram Rendering | React Flow (node-based canvas) |
| Export | Server-side rendering for PDF/PNG/SVG |

---

## Core Features

### Feature 1: AI Diagram Generation (MVP)

**The "zero to diagram" experience.** Users should go from nothing to a full diagram in under 60 seconds.

**Input methods (prioritized):**

1. **Natural language prompt** — User describes their workflow or org structure in plain text. An LLM (Claude or OpenAI) generates a structured diagram definition that renders instantly on canvas.
2. **Markdown/Mermaid file upload** — User drops in a `.md` file containing a Mermaid diagram, swimlane diagram, or any structured text. Diagram parses it and renders as an editable visual diagram.
3. **AI agent output** — Accept structured JSON/YAML output from external AI agents or automation tools. Standard input schema documented for integrations.

**AI generation flow:**
```
User input (text, file, or paste) 
  → LLM processes into Diagram diagram schema (JSON)
  → Schema validates and renders on React Flow canvas
  → User can immediately edit, rearrange, and style
```

**LLM output schema (internal):**
The AI generates a JSON structure containing:
- `nodes[]` — Each node has: id, type (process/decision/database/person/tool), label, description, position hints, icon/logo reference
- `edges[]` — Each edge has: source, target, label, animated (boolean), style
- `lanes[]` — (for swimlane diagrams) lane id, label, assigned nodes
- `metadata` — diagram type (orgchart | workflow | swimlane), title, description

---

### Feature 2: Org Chart Diagramming

**Visual org chart builder** for companies with ~5-50 people.

**Capabilities:**
- **Vertical (hierarchical) layout** — Traditional top-down org tree. CEO → VPs → Managers → ICs.
- **Matrix organization layout** — Employees can belong to multiple reporting lines (solid line = direct report, dotted line = cross-functional).
- **Node details** — Each person node shows: name, role/title, department, optional photo/avatar.
- **Drag to restructure** — Drag a person node onto a new manager to reassign reporting lines.
- **AI-assisted creation** — "I have a CEO, 2 VPs (Sales and Ops), Sales has 3 reps, Ops has a warehouse manager with 4 staff" → instant org chart.

**Layout engine:**
- Auto-layout using dagre or ELK algorithms for clean hierarchical positioning
- Manual override — any node can be dragged to a custom position and it "sticks"

---

### Feature 3: Workflow / Swimlane Diagramming

**The flagship feature.** Horizontal swimlane diagrams showing how data and work moves across people, roles, and tools.

**Core principles:**
- Each **swim lane** represents a person, role, department, or system
- **Data flow is the hero** — you should be able to trace a piece of data (e.g., a customer order) from entry to completion across lanes
- **Tool/service nodes use real product names as styled text** — not generic database cylinders. If data hits Supabase, the node says "Supabase" in a distinctly styled box. If it goes through Stripe, it says "Stripe." Each category (database, payment, CRM, communication) gets its own color scheme so you can scan the diagram and instantly understand what type of tool data is touching. This is a key differentiator for readability.

**Tool/service node display:**
- Nodes for external tools display the **product name as styled text** (e.g., "Supabase", "Stripe", "QuickBooks") inside a distinct node shape — no logo images for MVP.
- Tool nodes are visually distinct from person/process nodes via shape, color-coding by category (e.g., blue for databases, green for payments, orange for CRM), and a subtle icon type indicator (database, API, messaging, etc.).
- This avoids any trademark/licensing concerns and keeps the build simple.
- **V2:** Add optional logo upload per node so users can brand their diagrams with real logos if they want.

**Swimlane behaviors:**
- Lanes are horizontal, scrollable for complex workflows
- Lanes can be reordered by drag
- Lanes can be collapsed/expanded
- Connections between nodes across lanes are clearly routed (no spaghetti — use orthogonal routing)
- Animated flow option — show data "moving" along the path for presentations

**Node types for workflows:**
| Node Type | Visual | Purpose |
|-----------|--------|---------|
| Process | Rounded rectangle | A step someone does |
| Decision | Diamond | Yes/No branch point |
| Tool/Service | Product name text in styled rounded square | External tool (color-coded by category) |
| Data Store | Product name text in container shape | Database or storage (color-coded by category) |
| Start/End | Circle/pill | Entry and exit points |
| Handoff | Arrow badge | Explicit handoff between lanes |

---

### Feature 4: Canvas Editor (Drag & Drop)

**Post-generation editing** — once a diagram exists (from AI or file upload), users need a fast, intuitive way to modify it.

**Editor capabilities:**
- **Node palette** — sidebar with draggable node types. Drag a "Process" box or a tool/service node (e.g., "Stripe") onto the canvas. Tool nodes can be typed with a product name and auto-categorized.
- **Quick-connect** — drag from a node's connection handle to another node to create an edge. Edge labels editable inline.
- **Multi-select** — shift+click or lasso to select multiple nodes. Move as group, delete, or style together.
- **Inline editing** — double-click any node or edge label to edit text in place.
- **Undo/redo** — full history stack, Cmd+Z / Cmd+Shift+Z.
- **Zoom & pan** — scroll to zoom, drag canvas to pan. Minimap in corner for large diagrams.
- **Snap to grid** — optional grid alignment for clean layouts.
- **Auto-layout button** — one click to re-run layout algorithm on messy diagrams.
- **AI assist in editor** — select a section of the diagram, right-click → "Add steps between these nodes" or "Suggest what happens after this step" using AI.

---

### Feature 5: Export (Open Data Philosophy)

**Diagrams are the user's data.** No lock-in.

**MVP exports:**
- PNG (high-res)
- SVG (scalable)
- PDF (print-ready, with optional title page)
- JSON (Diagram native schema — reimportable)
- Mermaid markdown (round-trip: import mermaid → edit → export mermaid)

**Post-MVP exports (V2):**
- PowerPoint (.pptx) — diagram as editable shapes, not just an image
- Visio (.vsdx)
- Lucidchart-compatible format
- CSV of nodes/edges (for spreadsheet people)

---

## Data Model (Supabase)

### Tables

```sql
-- Users (synced from Clerk via webhook)
create table public.profiles (
  id text primary key,                -- Clerk user ID (e.g., user_2abc123...)
  clerk_user_id text unique not null,  -- Same as id, explicit for clarity
  full_name text,
  avatar_url text,
  plan text default 'individual' check (plan in ('individual', 'team')),
  trial_ends_at timestamptz,          -- Synced from Clerk trial status
  created_at timestamptz default now()
);

-- Teams
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references public.profiles(id) not null,
  plan text default 'team',
  max_seats int default 5,
  created_at timestamptz default now()
);

-- Team members
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  invited_at timestamptz default now(),
  unique(team_id, user_id)
);

-- Diagrams
create table public.diagrams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null,
  team_id uuid references public.teams(id), -- null for individual diagrams
  title text not null default 'Untitled Diagram',
  description text,
  type text not null check (type in ('orgchart', 'workflow', 'swimlane')),
  schema_version int default 1,
  canvas_data jsonb not null default '{}', -- React Flow serialized state
  thumbnail_url text,
  is_template boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Diagram versions (auto-save history)
create table public.diagram_versions (
  id uuid primary key default gen_random_uuid(),
  diagram_id uuid references public.diagrams(id) on delete cascade,
  canvas_data jsonb not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Tool/service categories (for node color-coding)
create table public.tool_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null, -- 'database', 'payments', 'crm', 'communication', etc.
  color text not null, -- hex color for category
  icon_type text -- generic icon identifier for the category
);

-- Usage tracking (for plan limits)
create table public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  month date not null, -- first of month
  diagram_count int default 0,
  ai_generation_count int default 0,
  unique(user_id, month)
);
```

### Row Level Security
- Users can only read/write their own diagrams
- Team members can read/write diagrams where `team_id` matches their team
- Team owners/admins can manage team members
- Tool categories readable by all authenticated users

---

## Pricing

| Plan | Price | Seats | Diagrams | AI Generations |
|------|-------|-------|----------|---------------|
| Individual | $8/mo | 1 | 100/mo | 50/mo |
| Team | $20/mo | Up to 5 | 500/mo (shared) | 200/mo (shared) |

**Payment:** Clerk Billing handles subscriptions and payment collection. Stripe runs behind Clerk's wall — we configure our Stripe key in Clerk, but never interact with Stripe directly. Clerk manages checkout, invoicing, plan changes, and cancellations.

**Free tier:** None. Paid only. 14-day free trial managed via Clerk's built-in trial tooling (full Team features during trial to reduce friction).

**Overage:** Soft cap — show warning at 80% and 100%, allow ~10% grace, then block creation until next billing cycle.

---

## User Flows

### Flow 1: New User Signup
```
Landing page → "Start free trial" → Clerk Auth (email/Google/GitHub)
→ Clerk creates user + starts 14-day trial automatically
→ Onboarding: "What do you want to create?" (Org Chart / Workflow)
→ Choose input method: "Describe it" / "Upload a file" / "Start blank"
→ First diagram generated → Canvas editor
→ Trial banner with days remaining (powered by Clerk trial status)
```

### Flow 2: AI Diagram Generation
```
Dashboard → "New Diagram" → Select type (Org Chart / Workflow)
→ Text input area: "Describe your workflow..." OR file upload zone
→ "Generate" button → Loading state (streaming response)
→ Diagram renders on canvas → User edits → Auto-saves
```

### Flow 3: Consultant Handoff
```
Consultant creates diagram on their account
→ Exports as Diagram JSON or shares view link
→ Client signs up → Imports JSON → Full editing capability
→ Client pays $8/mo to maintain and update
```

---

## Pages / Routes

```
/                     — Marketing landing page
/login                — Auth (login/signup)
/dashboard            — Diagram list, usage stats, new diagram CTA
/diagram/[id]         — Canvas editor (main app experience)
/diagram/[id]/present — Presentation mode (clean, no UI chrome)
/settings             — Profile, plan, billing (Clerk billing portal)
/settings/team        — Team management (invite, remove, roles via Clerk Organizations)
/templates            — Browse starter templates
/import               — File upload / paste for MD/Mermaid/JSON import
/api/ai/generate      — API route: LLM diagram generation
/api/ai/suggest       — API route: contextual AI suggestions in editor
/api/export/[format]  — API route: server-side export rendering
/api/webhooks/clerk   — Clerk webhook handler (user sync, billing events, trial status)
```

---

## Non-Functional Requirements

- **Performance:** Canvas must handle 200+ nodes without lag. Use React Flow virtualization.
- **Auto-save:** Debounced save to Supabase every 2 seconds of inactivity. Version history every 5 minutes of active editing.
- **Mobile:** Responsive dashboard. Canvas editor is desktop-only (touch diagramming is a bad UX — don't fight it).
- **Accessibility:** Keyboard navigation for node selection and connection. Screen reader labels on all nodes.
- **Security:** All diagram data is private by default. RLS enforced at database level. No public sharing without explicit link generation.

---

## MVP Scope (V1 — Build This First)

1. ✅ Auth (Clerk — email + Google + GitHub OAuth)
2. ✅ AI diagram generation from text prompt (Claude API)
3. ✅ Mermaid file import → editable diagram
4. ✅ Org chart builder (vertical layout)
5. ✅ Workflow/swimlane builder with text-labeled tool nodes
6. ✅ Drag-and-drop canvas editor (React Flow)
7. ✅ Node palette with standard + tool/service node types
8. ✅ Auto-layout
9. ✅ PNG/SVG/PDF export
10. ✅ JSON export/import (round-trip)
11. ✅ Clerk Billing (individual + team plans, Stripe behind Clerk)
12. ✅ Dashboard with diagram list
13. ✅ Tool/service nodes with product name text labels and category color-coding

## Post-MVP (V2)

- PowerPoint / Visio export
- Real-time collaboration (Supabase Realtime)
- Diagram templates library
- Custom logo upload for tool/service nodes (replace text with brand logos)
- Presentation mode with animated data flow
- API for external agent integration
- Matrix org chart layout
- Diagram versioning UI (visual diff)
- OpenAI as alternative AI provider
- Embeddable diagrams (iframe/script)

---

## Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| AI generates bad/unusable diagrams | Strong system prompts, structured output schema, always drop into editable canvas so user can fix |
| React Flow performance at scale | Virtualization, limit free-tier node count, lazy render off-screen |
| Text-only tool nodes feel generic | Strong color-coding by category, distinct shapes, and clear typography make nodes scannable. Logo upload in V2 for users who want brand visuals. |
| Mermaid parsing edge cases | Use established mermaid-js parser, graceful fallback to "we couldn't parse this, try AI instead" |
| Low conversion from trial | 14-day trial with full features, email drip during trial, focus on "first diagram in 60 seconds" onboarding |

---

## Success Metrics

- **Activation:** 70% of signups create their first diagram within first session
- **Time to first diagram:** Under 60 seconds from prompt to rendered diagram
- **Retention:** 40% monthly active rate among paying users
- **Conversion:** 15% trial → paid within 14 days
- **Revenue target:** 100 paying users within 6 months = ~$1,000 MRR baseline
