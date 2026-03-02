# Diagram — Frontend Architecture

## Overview

The Diagram frontend is a Next.js (App Router) application hosted on Vercel. It owns the full client-side experience: routing, page rendering, the React Flow canvas editor, state management, and all user-facing interactions. Auth and billing are handled by Clerk (`@clerk/nextjs`). Data persistence is via Supabase. AI generation and export go through Next.js API routes.

---

## Tech Stack

| Concern | Technology |
|---------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Canvas | React Flow (@xyflow/react) |
| Layout Algorithms | dagre / ELK.js (for auto-layout) |
| Auth & Billing | Clerk (`@clerk/nextjs` — auth, billing portal, trial management) |
| State Management | Zustand (canvas state) + Clerk hooks (auth/user/billing) |
| Styling | Tailwind CSS + CSS Modules for component-scoped styles |
| Data Fetching | Supabase JS client (real-time subscriptions for V2) |
| Forms | React Hook Form + Zod validation |
| Icons | Lucide React |
| Hosting | Vercel (edge + serverless functions) |

---

## Directory Structure

```
src/
├── proxy.ts                      # Clerk middleware (clerkMiddleware() — NOT middleware.ts)
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Landing page, public routes
│   │   ├── page.tsx              # / — landing page
│   │   └── layout.tsx
│   ├── (auth)/                   # Auth routes (Clerk-managed)
│   │   ├── sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in
│   │   ├── sign-up/[[...sign-up]]/page.tsx   # Clerk sign-up
│   │   └── layout.tsx
│   ├── (app)/                    # Authenticated app shell
│   │   ├── dashboard/page.tsx    # Diagram list, usage stats
│   │   ├── diagram/[id]/
│   │   │   ├── page.tsx          # Canvas editor
│   │   │   └── present/page.tsx  # Presentation mode
│   │   ├── settings/
│   │   │   ├── page.tsx          # Profile (Clerk UserProfile), billing (Clerk billing portal)
│   │   │   └── team/page.tsx     # Team management (Clerk Organizations)
│   │   ├── templates/page.tsx    # Template browser
│   │   ├── import/page.tsx       # File upload/paste
│   │   └── layout.tsx            # App shell with sidebar
│   ├── api/                      # API routes (server-side)
│   │   ├── ai/generate/route.ts
│   │   ├── ai/suggest/route.ts
│   │   ├── export/[format]/route.ts
│   │   └── webhooks/clerk/route.ts
│   ├── layout.tsx                # Root layout
│   └── globals.css
├── components/                   # Shared UI components (see UI.md)
├── features/                     # Feature-specific modules
│   ├── canvas/                   # React Flow canvas
│   │   ├── CanvasEditor.tsx      # Main canvas wrapper
│   │   ├── nodes/                # Custom node components
│   │   │   ├── ProcessNode.tsx
│   │   │   ├── DecisionNode.tsx
│   │   │   ├── ToolServiceNode.tsx
│   │   │   ├── DataStoreNode.tsx
│   │   │   ├── PersonNode.tsx
│   │   │   ├── StartEndNode.tsx
│   │   │   └── HandoffNode.tsx
│   │   ├── edges/                # Custom edge components
│   │   ├── panels/               # Sidebar panels (node palette, properties)
│   │   ├── hooks/                # Canvas-specific hooks
│   │   │   ├── useCanvasState.ts # Zustand store for canvas
│   │   │   ├── useAutoSave.ts
│   │   │   ├── useUndoRedo.ts
│   │   │   └── useAutoLayout.ts
│   │   └── utils/                # Layout algorithms, schema helpers
│   ├── ai/                       # AI generation UI
│   │   ├── GenerateDialog.tsx
│   │   ├── PromptInput.tsx
│   │   └── hooks/useAIGenerate.ts
│   ├── dashboard/                # Dashboard feature
│   ├── auth/                     # Auth flows
│   ├── export/                   # Export UI
│   └── import/                   # Import/parsing logic
├── lib/                          # Shared utilities
│   ├── clerk/
│   │   └── helpers.ts            # Clerk utility helpers (plan checks, trial status)
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server-side Supabase client (uses Clerk user ID for RLS)
│   ├── schema/                   # Diagram JSON schema types + validation
│   │   ├── diagram.ts            # DiagramSchema type
│   │   └── validate.ts           # Zod schema validation
│   └── utils/
├── stores/                       # Zustand stores
│   ├── canvasStore.ts            # Nodes, edges, viewport, selection
│   └── appStore.ts               # User, team, plan info
└── types/                        # Shared TypeScript types
    ├── diagram.ts
    ├── node.ts
    ├── edge.ts
    └── user.ts
```

---

## Key Architectural Decisions

### Canvas State (Zustand)

The React Flow canvas is the most performance-critical part of the app. Canvas state lives in a Zustand store — not React Context — to avoid unnecessary re-renders. The store holds nodes, edges, viewport position, selection state, and undo/redo history.

```typescript
// Simplified canvas store shape
interface CanvasStore {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  undoStack: CanvasSnapshot[];
  redoStack: CanvasSnapshot[];

  // Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addNode: (node: Node) => void;
  removeNodes: (ids: string[]) => void;
  connectNodes: (connection: Connection) => void;
  undo: () => void;
  redo: () => void;
  runAutoLayout: (algorithm: 'dagre' | 'elk') => void;
  loadDiagram: (schema: DiagramSchema) => void;
  serialize: () => DiagramSchema;
}
```

### Auto-Save Strategy

- Debounced writes to Supabase: save `canvas_data` after 2 seconds of inactivity
- Version snapshots: every 5 minutes of active editing, write to `diagram_versions`
- Optimistic UI: all changes are instant locally, Supabase writes are fire-and-forget with retry
- Conflict resolution (V2): last-write-wins for MVP, operational transforms for real-time collab

### Swimlane Implementation

Swimlanes are implemented as React Flow "group nodes" — a parent node that acts as a lane container. Child nodes are positioned relative to their lane. Lane reordering updates the Y-positions of all lane groups and their children.

```
Lane (group node, full-width, horizontal band)
├── Node A (positioned within lane bounds)
├── Node B
└── Node C
```

Orthogonal edge routing uses a custom edge component that calculates right-angle paths between nodes, avoiding overlaps with other nodes and lanes.

### Import Pipeline

All import formats (Mermaid, JSON, YAML) funnel through a normalization step that produces the internal `DiagramSchema` format before rendering:

```
User input → Parser (mermaid-js / JSON.parse / yaml) → DiagramSchema → Canvas
```

Mermaid parsing uses the `mermaid` npm package. Invalid input falls back to a friendly error with a "Try AI instead" CTA.

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Canvas render (100 nodes) | < 16ms per frame (60fps) |
| Canvas render (200+ nodes) | < 33ms per frame (30fps minimum) |
| Time to interactive (dashboard) | < 1.5s |
| Time to interactive (canvas) | < 2.5s |
| Auto-save latency | < 500ms to Supabase |
| AI generation → canvas render | < 3s after LLM response |

React Flow's built-in virtualization handles off-screen node culling. For diagrams exceeding 200 nodes, we lazy-render decorative elements (labels, icons) and simplify edge routing.

---

## Responsibilities & Boundaries

**Frontend owns:**
- All page rendering and routing
- React Flow canvas and all node/edge components
- Client-side state management (Zustand)
- Import parsing (Mermaid, JSON, YAML → DiagramSchema)
- Auto-save orchestration
- Undo/redo history
- Layout algorithm execution (dagre/ELK run client-side)
- Export UI (triggers server-side rendering via API routes)

**Frontend does NOT own:**
- Database schema or migrations (→ Backend)
- Auth session management (→ Clerk / Backend)
- Billing and subscription management (→ Clerk / Backend)
- AI prompt engineering or LLM calls (→ Backend API routes)
- Server-side export rendering (→ Backend API routes)
- Clerk webhook handling (→ Backend)
- Row Level Security policies (→ Backend)

---

## Open Questions

1. Should auto-layout run client-side (dagre/ELK in browser) or server-side for very large diagrams?
2. What's the maximum diagram size before we recommend splitting into sub-diagrams?
3. Should we use React Flow Pro for additional features, or stay on the open-source version?
