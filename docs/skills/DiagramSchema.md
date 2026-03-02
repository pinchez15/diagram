# Skill: Diagram Schema (Shared Contract)

## Overview

The `DiagramSchema` is the most critical shared interface in the Diagram codebase. It's the JSON format that flows between Backend (AI generates it), Frontend (parses, stores, renders it), and UI (determines visual rendering). Changes to this schema affect all three layers.

**See Philosophy.md for the change protocol.** Any modification to this schema is a breaking change.

---

## Schema Definition

```typescript
// src/types/diagram.ts

export interface DiagramSchema {
  schema_version: number          // Currently 1. Increment on breaking changes.
  metadata: DiagramMetadata
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  lanes?: DiagramLane[]           // Only present for 'swimlane' type
}

export interface DiagramMetadata {
  type: 'orgchart' | 'workflow' | 'swimlane'
  title: string
  description?: string
}

export interface DiagramNode {
  id: string                      // Unique within the diagram
  type: NodeType
  label: string                   // Display text (human-readable, plain language)
  description?: string            // Optional secondary text
  position: { x: number; y: number }  // Canvas position (absolute or layout hint)
  parentId?: string               // Lane ID for swimlane diagrams
  data?: Record<string, unknown>  // Extensible metadata

  // Tool/service node specific
  toolCategory?: ToolCategory     // For color-coding
  toolName?: string               // e.g., "Stripe", "Supabase", "Slack"
}

export type NodeType =
  | 'process'
  | 'decision'
  | 'toolService'
  | 'dataStore'
  | 'person'
  | 'startEnd'
  | 'handoff'

export type ToolCategory =
  | 'database'
  | 'payments'
  | 'crm'
  | 'communication'
  | 'analytics'
  | 'storage'
  | 'api'

export interface DiagramEdge {
  id: string
  source: string                  // Source node ID
  target: string                  // Target node ID
  label?: string                  // Edge label (e.g., "Yes", "Approved")
  animated?: boolean              // For data flow visualization
  style?: 'solid' | 'dashed' | 'dotted'
}

export interface DiagramLane {
  id: string
  label: string                   // Lane title (e.g., "Sales Team", "Finance")
  order: number                   // Display order (top to bottom)
  collapsed?: boolean
  nodeIds: string[]               // Nodes belonging to this lane
}
```

---

## Zod Validation Schema

```typescript
// src/lib/schema/validate.ts
import { z } from 'zod'

export const NodeTypeEnum = z.enum([
  'process', 'decision', 'toolService', 'dataStore',
  'person', 'startEnd', 'handoff',
])

export const ToolCategoryEnum = z.enum([
  'database', 'payments', 'crm', 'communication',
  'analytics', 'storage', 'api',
])

export const DiagramNodeSchema = z.object({
  id: z.string().min(1),
  type: NodeTypeEnum,
  label: z.string().min(1),
  description: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }),
  parentId: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  toolCategory: ToolCategoryEnum.optional(),
  toolName: z.string().optional(),
})

export const DiagramEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().optional(),
  animated: z.boolean().optional(),
  style: z.enum(['solid', 'dashed', 'dotted']).optional(),
})

export const DiagramLaneSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  order: z.number(),
  collapsed: z.boolean().optional(),
  nodeIds: z.array(z.string()),
})

export const DiagramSchemaValidator = z.object({
  schema_version: z.number().int().positive(),
  metadata: z.object({
    type: z.enum(['orgchart', 'workflow', 'swimlane']),
    title: z.string().min(1),
    description: z.string().optional(),
  }),
  nodes: z.array(DiagramNodeSchema),
  edges: z.array(DiagramEdgeSchema),
  lanes: z.array(DiagramLaneSchema).optional(),
})

export function validateDiagramSchema(data: unknown) {
  return DiagramSchemaValidator.safeParse(data)
}
```

---

## Where the Schema is Used

| Layer | How It Uses the Schema |
|-------|----------------------|
| **Backend (AI generate)** | LLM system prompt defines this schema. AI output is validated with Zod before returning. |
| **Backend (Storage)** | Stored as `canvas_data` JSONB in the `diagrams` table. |
| **Frontend (Import)** | Mermaid/JSON/YAML imports are normalized to this schema. |
| **Frontend (Canvas)** | `loadDiagram()` maps DiagramSchema → React Flow nodes/edges. `serialize()` maps back. |
| **Frontend (Export)** | JSON export outputs this schema directly. Mermaid export converts from it. |
| **UI (Rendering)** | `node.type` determines which React component renders. `toolCategory` determines color. |

---

## Mapping: DiagramSchema ↔ React Flow

```typescript
// DiagramSchema → React Flow nodes
function schemaToReactFlow(schema: DiagramSchema) {
  const rfNodes = schema.nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    parentId: node.parentId,
    data: {
      label: node.label,
      description: node.description,
      toolCategory: node.toolCategory,
      toolName: node.toolName,
      ...node.data,
    },
  }))

  const rfEdges = schema.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: edge.animated ?? false,
    type: 'orthogonal',
    data: { style: edge.style ?? 'solid' },
  }))

  // Add lane group nodes
  if (schema.lanes) {
    const laneNodes = schema.lanes.map((lane, i) => ({
      id: lane.id,
      type: 'swimlane',
      position: { x: 0, y: i * 220 },
      data: { label: lane.label, collapsed: lane.collapsed },
      style: { width: 1200, height: 200 },
    }))
    rfNodes.unshift(...laneNodes)
  }

  return { nodes: rfNodes, edges: rfEdges }
}
```

---

## AI System Prompt Fragment

When Backend agents build the AI generation prompt, include this schema definition:

```
You must output valid JSON matching this schema:
{
  "schema_version": 1,
  "metadata": { "type": "workflow|orgchart|swimlane", "title": "...", "description": "..." },
  "nodes": [
    { "id": "unique-id", "type": "process|decision|toolService|dataStore|person|startEnd|handoff",
      "label": "Human-readable label", "description": "Optional detail",
      "position": { "x": 0, "y": 0 },
      "toolCategory": "database|payments|crm|communication|analytics|storage|api",
      "toolName": "e.g. Stripe, Supabase, Slack" }
  ],
  "edges": [
    { "id": "unique-id", "source": "node-id", "target": "node-id",
      "label": "Optional label", "animated": false, "style": "solid|dashed|dotted" }
  ],
  "lanes": [
    { "id": "lane-id", "label": "Lane Name", "order": 0, "nodeIds": ["node-id-1", "node-id-2"] }
  ]
}

Rules:
- Node labels should be clear, concise, plain language (readable by non-technical users)
- Tool/service nodes MUST include toolCategory and toolName
- Position hints are relative — the layout engine will finalize positions
- For swimlane type, every non-lane node must have a parentId matching a lane ID
- Edge labels should describe the condition or data flowing (e.g., "Order approved", "Payment received")
```

---

## Key Rules for Agents

1. **Schema changes require updating all three layers** (Backend, Frontend, UI) — see Philosophy.md
2. **Always validate with Zod** before trusting data from AI or imports
3. **`schema_version` must increment** on breaking changes for forward compatibility
4. **Additive changes (new optional fields) are safe** and don't require version bump
5. **Node labels must be plain language** — the Vision doc demands readability for non-technical users
6. **Tool nodes always need `toolCategory` and `toolName`** — this drives the color-coding system
