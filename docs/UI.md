# Diagram — UI Design System & UX Patterns

## Overview

This document defines Diagram's visual design language, component library, and UX patterns. It serves as the single source of truth for how Diagram looks and feels, ensuring consistency across all pages and features. Any agent working on user-facing code should reference this doc.

---

## Design Philosophy: Notion-Minimal

Diagram's UI takes direct inspiration from **Notion's design language**: clean, minimal, content-first. The interface should feel like it barely exists — just you and your diagram. Every pixel of chrome that isn't the canvas or a direct manipulation control should justify its existence.

**The Notion Parallels:**
- **Slash commands and contextual menus** over crowded toolbars
- **Inline editing** everywhere — click text to edit, no separate "edit mode"
- **Hover to reveal controls** — buttons and handles appear only when relevant
- **Whitespace is a feature** — generous padding, no visual clutter
- **Monochrome with selective color** — the UI is grayscale; color is reserved for the diagram content itself (node categories, status)

## Design Principles

1. **Minimal over maximal** — If an element can be hidden until needed, hide it. Toolbars appear on hover. Properties panels slide in on selection. The default state is a clean canvas with nothing in the way.
2. **The canvas is the product** — Minimize UI chrome around the canvas editor. The diagram should take up maximum screen real estate. No persistent sidebars unless the user pins them.
3. **Drag-and-drop as the primary interaction** — Everything that can be dragged, should be. Nodes from the palette to canvas. Nodes within the canvas. Lanes to reorder. Files from the desktop to import. Drag-and-drop is intuitive for non-technical users and reduces the need for menus and buttons.
4. **Premade elements over blank slates** — Provide well-designed, ready-to-use node types, templates, and common workflow patterns. Users should assemble diagrams from building blocks, not design from scratch. The node palette should feel like a component library, not a drawing toolbox.
5. **Auto-save, always** — The user should never think about saving. Every change persists automatically. If the browser crashes, the tab closes, or the laptop dies, the user returns to exactly where they left off. Show a subtle "Saved" indicator, nothing more. No save button exists anywhere in the app.
6. **Speed is a feature** — Every interaction should feel instant. Loading states should be brief and informative. The "zero to diagram in 60 seconds" promise lives in the UI.
7. **Data is portable** — Export and sharing options should always be easy to reach. Never hide the user's escape routes.

---

## Color System

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-primary` | `#2563EB` | Primary actions, links, active states |
| `--brand-primary-hover` | `#1D4ED8` | Hover state for primary |
| `--brand-secondary` | `#7C3AED` | AI-related features, generation CTA |
| `--brand-accent` | `#059669` | Success states, positive indicators |

### Neutral Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--neutral-50` | `#FAFAFA` | Page backgrounds |
| `--neutral-100` | `#F5F5F5` | Card backgrounds, canvas background |
| `--neutral-200` | `#E5E5E5` | Borders, dividers |
| `--neutral-300` | `#D4D4D4` | Disabled states |
| `--neutral-500` | `#737373` | Secondary text |
| `--neutral-700` | `#404040` | Primary text |
| `--neutral-900` | `#171717` | Headings, high-emphasis text |

### Tool/Service Category Colors

These colors are used on canvas nodes to categorize tool/service types at a glance:

| Category | Color | Hex | Example Tools |
|----------|-------|-----|---------------|
| Database | Blue | `#3B82F6` | Supabase, PostgreSQL, MongoDB |
| Payments | Green | `#10B981` | Stripe, PayPal, Square |
| CRM | Orange | `#F97316` | HubSpot, Salesforce |
| Communication | Purple | `#8B5CF6` | Slack, Email, Twilio |
| Analytics | Teal | `#14B8A6` | PostHog, Mixpanel, GA |
| Storage | Amber | `#F59E0B` | S3, Google Drive, Dropbox |
| API/Integration | Rose | `#F43F5E` | Zapier, Make, custom APIs |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#059669` | Success messages, completed states |
| `--warning` | `#D97706` | Warnings, usage approaching limits |
| `--error` | `#DC2626` | Errors, destructive actions |
| `--info` | `#2563EB` | Informational messages |

---

## Typography

| Role | Font | Size | Weight | Line Height |
|------|------|------|--------|-------------|
| H1 (page titles) | Inter | 28px | 700 | 1.2 |
| H2 (section heads) | Inter | 22px | 600 | 1.3 |
| H3 (subsections) | Inter | 18px | 600 | 1.4 |
| Body | Inter | 14px | 400 | 1.5 |
| Body small | Inter | 13px | 400 | 1.5 |
| Caption | Inter | 12px | 400 | 1.4 |
| Node label | Inter | 13px | 500 | 1.2 |
| Node description | Inter | 11px | 400 | 1.3 |
| Code / schema | JetBrains Mono | 13px | 400 | 1.5 |

---

## Spacing Scale

Based on a 4px grid:

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |

---

## Component Library

### Buttons

| Variant | Use Case | Style |
|---------|----------|-------|
| Primary | Main CTA ("Generate", "Save") | Filled, `--brand-primary`, white text |
| Secondary | Supporting actions ("Cancel", "Export as...") | Outlined, `--neutral-700` border |
| Ghost | Toolbar actions, inline actions | No border, subtle hover background |
| Danger | Destructive actions ("Delete diagram") | Filled `--error`, white text |
| AI | AI-powered actions ("Generate with AI") | Filled `--brand-secondary`, white text, subtle shimmer animation |

All buttons: 36px height (default), 32px (compact/toolbar), 8px horizontal padding, 6px border-radius.

### Cards

Used for diagram thumbnails on the dashboard.

- White background, 1px `--neutral-200` border, 8px border-radius
- Thumbnail image (aspect ratio 16:10)
- Title (body weight 500), subtitle (caption, `--neutral-500`)
- Hover: subtle shadow elevation, border transitions to `--brand-primary`
- Actions (kebab menu): export, duplicate, delete

### Input Fields

- 36px height, 8px padding, 6px border-radius
- Border: `--neutral-200`, focus: `--brand-primary` with 2px ring
- Label above (caption weight 500), error message below (caption, `--error`)
- Placeholder text: `--neutral-300`

### Dialog / Modal

- Centered, max-width 520px
- Overlay: black at 40% opacity
- White background, 12px border-radius, 24px padding
- Close button (X) top-right
- Action buttons bottom-right (secondary left, primary right)

### Toast Notifications

- Fixed bottom-right, stacked
- Auto-dismiss after 4 seconds (errors persist until dismissed)
- Variants: success (green left border), error (red), info (blue), warning (amber)

---

## Canvas-Specific UI

### Node Palette (Left Sidebar)

A Notion-style collapsible panel showing **premade, draggable node elements**. The palette is a component library — not a blank shape drawer. Each element is a fully styled, ready-to-use node that the user drags onto the canvas and customizes by editing the label inline.

```
┌─────────────────────┐
│ ELEMENTS        [<]  │
│                      │
│ ── Workflow ──       │
│ [□] Process Step     │
│ [◇] Decision         │
│ [○] Start / End      │
│ [→] Handoff          │
│                      │
│ ── Tools ──          │
│ [■] Database    🔵   │
│ [■] Payment    🟢   │
│ [■] CRM        🟠   │
│ [■] Messaging  🟣   │
│ [■] Analytics  🟤   │
│ [■] Storage    🟡   │
│ [■] API        🔴   │
│                      │
│ ── People ──         │
│ [👤] Person          │
│ [👥] Team / Dept     │
│                      │
│ ── Layout ──         │
│ [═] Swim Lane        │
│ [┄] Section Divider  │
└─────────────────────┘
```

Width: 240px (expanded), 48px (collapsed — icons only). **Default state: collapsed** (Notion-style — maximize canvas space). Opens on hover or click of the thin icon rail. Drag preview shows a ghost of the styled node with a drop-shadow to indicate it's "lifted."

**Drag-and-drop behavior:**
- Drag any element from the palette directly onto the canvas
- Drop zones highlight when a dragged element hovers over valid positions
- Dropping into a swim lane automatically parents the node to that lane
- Dropping onto an existing edge splits the edge and inserts the new node between the source and target

### Properties Panel (Right Sidebar)

Shows when a node or edge is selected:

- Node: label (editable), description (editable), type (read-only), category color (for tool nodes)
- Edge: label (editable), animated toggle, style (solid/dashed/dotted)
- Multiple selection: shared properties only, batch operations

Width: 280px. Slides in from right on selection, slides out on deselect.

### Toolbar (Top of Canvas)

```
[← Dashboard]  [Diagram Title ✎]                    [Saved ✓]  [AI ✨]  [Export ▾]  [···]
```

Ultra-minimal 40px height bar. The toolbar shows only essentials: navigation back, the editable title, save status, AI trigger, and export. Undo/redo, zoom, auto-layout, and other tools live in a `[···]` overflow menu or are accessible via keyboard shortcuts (Cmd+Z, Cmd+Shift+Z, Cmd+0 to fit, etc.). The toolbar fades to 50% opacity when the user is actively working on the canvas, and returns to full opacity on hover — keeping focus on the diagram.

### Save Status Indicator

The save indicator is the only feedback the user gets about persistence:
- **"Saved ✓"** — Default state, subtle gray text. Everything is persisted.
- **"Saving..."** — Brief, during the debounce write. Appears for < 1 second typically.
- **"Offline"** — If connection is lost. Queues changes locally and syncs when reconnected.

There is no save button. Auto-save runs on every change with a 2-second debounce. Version history snapshots every 5 minutes of active editing. If the user closes the tab and reopens, they land on the exact same canvas state.

### Swimlane Layout

```
┌──────────────────────────────────────────────────┐
│ 📋 Sales Team                              [≡] [−] │
│ ┌──────┐    ┌──────┐    ┌──────┐                 │
│ │Lead  │───▶│Qualify│───▶│Close │                 │
│ │Comes │    │Lead  │    │Deal  │                 │
│ │In    │    │      │    │      │                 │
│ └──────┘    └──────┘    └──────┘                 │
├──────────────────────────────────────────────────┤
│ 📋 Finance                                 [≡] [−] │
│                          ┌──────────┐            │
│                          │ Stripe   │            │
│                          │ 💳       │            │
│                          └──────────┘            │
└──────────────────────────────────────────────────┘
```

Lane controls: [≡] drag handle for reorder, [−] collapse toggle.

### Node Visual Specifications

| Node Type | Shape | Size | Border | Background |
|-----------|-------|------|--------|------------|
| Process | Rounded rect (6px radius) | 160×60px | 1.5px `--neutral-300` | White |
| Decision | Diamond (rotated square) | 100×100px | 1.5px `--neutral-300` | White |
| Tool/Service | Rounded rect (8px radius) | 160×60px | 2px category color | Category color at 10% opacity |
| Data Store | Rounded rect with top accent | 160×60px | 2px category color | Category color at 10% opacity |
| Start/End | Pill (full radius) | 120×40px | 1.5px `--neutral-500` | `--neutral-100` |
| Person | Rounded rect with avatar circle | 180×70px | 1.5px `--neutral-300` | White |
| Handoff | Arrow badge | 100×40px | 1.5px `--brand-primary` | `--brand-primary` at 10% |

All nodes: drop shadow on hover (`0 2px 8px rgba(0,0,0,0.1)`), blue ring on selection (`--brand-primary` 2px).

---

## Page Layouts

### Dashboard

- Top bar: logo, search, user avatar + dropdown
- Grid of diagram cards (3 columns on desktop, responsive)
- Sidebar: usage stats, quick actions ("New Diagram", "Import")
- Empty state: illustration + "Create your first diagram" CTA

### Canvas Editor (Full Screen)

- No top navigation bar (maximize canvas space)
- Toolbar (top): undo/redo, layout, zoom, AI, export
- Node palette (left sidebar): collapsible
- Properties panel (right sidebar): contextual
- Minimap (bottom-right corner): small overview of full diagram
- Breadcrumb (top-left): back to dashboard, diagram title (editable inline)

### Settings

- Standard sidebar navigation (Profile, Billing, Team)
- Form-based layouts
- Stripe billing portal embedded via iframe or redirect

---

## Motion & Animation

| Interaction | Animation | Duration |
|-------------|-----------|----------|
| Node drag | None (instant position update) | 0ms |
| Node hover | Shadow elevation | 150ms ease |
| Panel slide in/out | Slide + fade | 200ms ease-out |
| Dialog open | Scale up + fade in | 200ms ease-out |
| Toast appear | Slide up + fade in | 200ms ease-out |
| Auto-layout rearrange | Smooth position transition | 400ms ease-in-out |
| AI generation loading | Pulsing shimmer on canvas | Continuous |
| Data flow animation | Dot moving along edge | 2s linear, loop |

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Desktop (≥1024px) | Full canvas editor with both sidebars |
| Tablet (768-1023px) | Dashboard responsive, canvas hides left sidebar by default |
| Mobile (<768px) | Dashboard only (cards stack to single column). Canvas shows "open on desktop" message. |

---

## Accessibility

- All interactive elements have visible focus rings (2px `--brand-primary`)
- Node selection via keyboard: Tab through nodes, Enter to select, arrow keys to navigate connections
- Color is never the only differentiator — tool categories also use shape + label
- Screen reader: nodes announce "Process node: [label]", edges announce "[source label] connects to [target label]"
- Minimum contrast ratio: 4.5:1 for all text
- Animations respect `prefers-reduced-motion`

---

## Responsibilities & Boundaries

**UI owns:**
- Color system, typography, spacing scale
- Component specifications and visual behavior
- Canvas node/edge visual design
- Layout patterns for all pages
- Animation and motion design
- Accessibility standards
- Responsive breakpoints

**UI does NOT own:**
- Component implementation (→ Frontend, following these specs)
- Data fetching or state management (→ Frontend)
- Canvas interaction logic (→ Frontend)
- API design (→ Backend)
