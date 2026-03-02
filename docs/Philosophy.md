# Diagram — Agent Coordination Philosophy

## Purpose

This document defines the rules of engagement for AI agents working on the Diagram codebase. Multiple agents may work on Frontend, Backend, and UI concerns simultaneously. This philosophy ensures they produce coherent, non-conflicting code that integrates cleanly.

---

## Core Rule

**Every agent must read the relevant doc before writing code.** The doc hierarchy is:

1. **PRD.md** — What we're building and why. The source of truth for product decisions.
2. **Vision.md** — Where we're going long-term. Informs architectural bets.
3. **Frontend.md / Backend.md / UI.md** — How each layer works. The source of truth for technical decisions within that domain.
4. **Philosophy.md (this doc)** — How agents coordinate. The source of truth for process.

If a doc doesn't cover a decision, the agent should make a reasonable choice AND document it in the relevant doc. Don't leave undocumented decisions for the next agent to rediscover.

---

## Agent Independence & Review Cycle

Agents work **independently** on their respective domains. No agent waits for another to finish before starting its own work. Each agent reads the docs, builds its piece, and tests it in isolation.

### The Checker Agent

A dedicated **Checker Agent** reviews completed work against the PRD and Vision docs. The cycle works like this:

```
1. Domain agent (e.g., Frontend) completes a feature
2. Domain agent writes and runs tests for that feature
3. Checker Agent reviews the work against PRD.md and Vision.md
4. Checker Agent provides specific, actionable feedback:
   - Does the implementation match the PRD requirements?
   - Does the UX align with the Vision (magical, readable, accessible)?
   - Are there gaps, inconsistencies, or drift from the product intent?
5. If changes needed → Domain agent takes feedback and iterates
6. Repeat steps 3-5 until coherence is achieved
7. Once coherent → commit
```

The Checker Agent does NOT write code. It reads the implementation, compares it to the docs, and gives feedback. The domain agent is always the one making changes.

### Coherence Standard

"Coherence" means:
- The feature works as described in the PRD (functional match)
- The experience aligns with the Vision (magical, simple, readable for a non-technical user)
- The code follows the conventions in this Philosophy doc
- Tests pass

The Checker Agent should be opinionated. If something technically works but feels clunky or confusing for a small business owner with limited tech experience, it's not coherent with the Vision. Push back.

### Test & Commit Cycle

Agents follow a disciplined test-and-commit workflow:

1. **Test as you build.** Write tests alongside implementation, not after. Unit tests for logic, integration tests for API routes, component tests for UI.
2. **Test before requesting review.** The Checker Agent should never see broken code. Run all tests before flagging work as ready for review.
3. **Commit after major feature completions.** Don't commit every small change. A "major feature" is a complete, testable unit of work — e.g., "AI generation endpoint works end-to-end" or "canvas editor renders all node types." Each commit should leave the codebase in a working state.
4. **Commit messages reference the PRD feature.** Format: `feat(frontend): AI diagram generation from text prompt [PRD Feature 1]`
5. **Never commit failing tests.** If tests fail, fix them first. If you can't fix them, document why and flag for the Checker Agent.

---

## Ownership Boundaries

Each agent has a clear domain. Respect the boundaries.

### Frontend Agent
- **Owns:** `src/app/`, `src/features/`, `src/stores/`, `src/lib/` (client utilities)
- **Can read:** Backend API route signatures, UI component specs
- **Cannot modify:** Database schema, RLS policies, API route internals, UI design tokens

### Backend Agent
- **Owns:** `src/app/api/`, Supabase schema/migrations, environment config
- **Can read:** Frontend data requirements, diagram schema types
- **Cannot modify:** React components, canvas logic, Zustand stores, CSS/styling

### UI Agent
- **Owns:** `src/components/`, design tokens, Tailwind config, global styles
- **Can read:** Frontend feature structure (to know where components are used), node type specs
- **Cannot modify:** API routes, database schema, feature logic, Zustand stores

### Shared Territory (requires coordination)
- **`src/types/`** — Shared TypeScript types. Any agent can propose changes, but must update all consumers.
- **`src/lib/schema/`** — Diagram JSON schema. Changes here affect Frontend (parsing), Backend (AI generation), and UI (node rendering). All three agents must be notified.

---

## Handoff Protocol

When an agent's work depends on another agent's output, follow this protocol:

### Interface-First Development
1. **Define the interface before implementing.** If Frontend needs a new API endpoint, the Frontend agent writes the expected request/response TypeScript types first. The Backend agent implements to match.
2. **Types are contracts.** Shared types in `src/types/` are the agreed-upon contract. If you need to change a type, update ALL files that import it.
3. **Mock until real.** Frontend can mock Backend responses using the agreed types. UI can build components with placeholder data. Don't block on another agent's implementation.

### Change Notification
When an agent changes a shared interface:
1. Update the type definition in `src/types/`
2. Add a comment at the top of the changed file: `// CHANGED: [date] [description] — affects [Frontend|Backend|UI]`
3. Update the relevant architecture doc (Frontend.md, Backend.md, or UI.md) if the change affects the documented architecture

---

## Conflict Resolution

### File Conflicts
- If two agents need to modify the same file, the **domain owner** has priority (see Ownership Boundaries above).
- For shared files (`src/types/`, `src/lib/schema/`): the agent who opened the change first has priority. The second agent adapts.

### Design Conflicts
- **Product decisions** → defer to PRD.md. If the PRD doesn't cover it, flag it as an open question.
- **Technical decisions within a domain** → the domain agent decides and documents.
- **Cross-domain technical decisions** → prefer the simplest solution that doesn't create coupling. Document the decision in both affected docs.

### When in Doubt
1. Choose the option that's easiest to change later.
2. Add a comment explaining the tradeoff.
3. Document the decision in the relevant architecture doc.

---

## Code Conventions

All agents must follow these conventions for consistency:

### TypeScript
- Strict mode enabled. No `any` unless absolutely necessary (and commented why).
- Prefer `interface` for object shapes, `type` for unions and intersections.
- Use barrel exports (`index.ts`) for feature directories.
- Enum alternatives: use `as const` objects for serializable enums.

### Naming
- Components: PascalCase (`ProcessNode.tsx`)
- Hooks: camelCase with `use` prefix (`useCanvasState.ts`)
- Utils: camelCase (`parseSchema.ts`)
- Types/Interfaces: PascalCase (`DiagramSchema`, `NodeType`)
- API routes: kebab-case paths (`/api/ai/generate`)
- Database: snake_case (`canvas_data`, `team_members`)
- CSS tokens: kebab-case with `--` prefix (`--brand-primary`)

### File Organization
- One component per file (with related sub-components as exceptions).
- Co-locate tests: `Component.test.tsx` next to `Component.tsx`.
- Co-locate hooks with their feature, not in a global hooks directory.
- Keep files under 300 lines. If larger, split into sub-components or utilities.

### Comments
- Don't comment obvious code.
- DO comment: business logic rationale, workarounds, performance decisions, and "why" over "what."
- TODO format: `// TODO(agent-name): description — ticket/issue reference if exists`

---

## The Diagram Schema Contract

The `DiagramSchema` type is the most critical shared interface. It's the data format that flows between:
- **Backend** (AI generates it)
- **Frontend** (parses, stores, and renders it)
- **UI** (determines how each node type looks)

Any change to `DiagramSchema` is a **breaking change** for all three layers. Treat it like a public API:
- Additive changes (new optional fields) are safe.
- Removing or renaming fields requires updating all three layers simultaneously.
- The schema includes a `schema_version` integer for forward compatibility.

```typescript
interface DiagramSchema {
  schema_version: number;
  metadata: {
    type: 'orgchart' | 'workflow' | 'swimlane';
    title: string;
    description?: string;
  };
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  lanes?: DiagramLane[];    // Only for swimlane type
}
```

---

## Quality Standards

### Every PR / Code Change Must:
1. Pass TypeScript compilation with zero errors
2. Not break existing functionality (if tests exist, they must pass)
3. Follow the naming and file organization conventions above
4. Include comments for non-obvious decisions
5. Update relevant architecture docs if the change affects documented patterns

### Performance Guards
- No synchronous operations that block the main thread for > 16ms
- No unbounded loops over user data (always paginate or limit)
- React Flow canvas operations must not trigger full re-renders (use Zustand selectors)

---

## Communication Format

When agents need to communicate decisions or flag issues, use this format in code comments or doc updates:

```
// DECISION: [description]
// CONTEXT: [why this choice was made]
// ALTERNATIVES: [what was considered and rejected]
// AFFECTS: [Frontend|Backend|UI]
```

---

## Summary

The goal is simple: multiple agents should be able to work on Diagram simultaneously without stepping on each other. Read the docs, respect the boundaries, define interfaces first, and document your decisions. The code should look like one person wrote it.
