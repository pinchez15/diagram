# Skill: React Flow (Canvas Engine)

## Overview

Diagram uses React Flow (`@xyflow/react`) as the canvas rendering engine. This is the most performance-critical part of the application. This skill documents patterns, pitfalls, and best practices for agents working on canvas-related features.

---

## Package

```
@xyflow/react
```

Install: `npm install @xyflow/react`

---

## Core Concepts

### Nodes

Nodes are the boxes on the canvas. Each node has an `id`, `type`, `position`, and `data` object.

```typescript
import { type Node } from '@xyflow/react'

const node: Node = {
  id: 'node-1',
  type: 'process',           // Maps to our custom node component
  position: { x: 100, y: 50 },
  data: {
    label: 'Review Order',
    description: 'Check order details and validate',
  },
  parentId: 'lane-1',        // For swimlane grouping
}
```

### Edges

Edges are connections between nodes.

```typescript
import { type Edge } from '@xyflow/react'

const edge: Edge = {
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  label: 'Approved',
  animated: false,
  type: 'orthogonal',        // Custom edge type for right-angle routing
}
```

### Custom Node Components

Register custom node types when initializing React Flow:

```tsx
import { ReactFlow } from '@xyflow/react'
import { ProcessNode } from './nodes/ProcessNode'
import { DecisionNode } from './nodes/DecisionNode'
import { ToolServiceNode } from './nodes/ToolServiceNode'

const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  toolService: ToolServiceNode,
  dataStore: DataStoreNode,
  person: PersonNode,
  startEnd: StartEndNode,
  handoff: HandoffNode,
  swimlane: SwimlaneNode,   // Group node for lanes
}

function CanvasEditor() {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      // ...
    />
  )
}
```

### Custom Node Template

Every custom node should follow this pattern:

```tsx
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { memo } from 'react'

type ProcessNodeData = {
  label: string
  description?: string
}

function ProcessNodeComponent({ data, selected }: NodeProps) {
  return (
    <div className={`process-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <div className="node-label">{data.label}</div>
      {data.description && (
        <div className="node-description">{data.description}</div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

export const ProcessNode = memo(ProcessNodeComponent)
```

**Critical: Always `memo()` wrap custom nodes.** React Flow relies on referential equality to avoid re-renders. Without `memo`, every canvas interaction re-renders every node.

---

## Performance Rules

1. **Always memoize custom node and edge components** with `React.memo()`
2. **Use Zustand selectors** — never pass the entire store to a component. Use `useStore(state => state.specificValue)`
3. **Never create new objects/arrays in render** — this breaks React Flow's memoization
4. **Use `onNodesChange` / `onEdgesChange` callbacks** from React Flow, not custom state updates
5. **For 200+ nodes:** Enable React Flow's built-in viewport culling (nodes outside viewport don't render)
6. **Avoid expensive computations in node components** — pre-compute in the store

### Zustand Integration

```tsx
import { useCallback } from 'react'
import {
  ReactFlow,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react'
import { useCanvasStore } from '@/stores/canvasStore'

function CanvasEditor() {
  // Use selectors — NOT useCanvasStore() without arguments
  const nodes = useCanvasStore(state => state.nodes)
  const edges = useCanvasStore(state => state.edges)
  const setNodes = useCanvasStore(state => state.setNodes)
  const setEdges = useCanvasStore(state => state.setEdges)

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes(applyNodeChanges(changes, nodes)),
    [nodes, setNodes]
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges]
  )

  const onConnect: OnConnect = useCallback(
    (params) => setEdges(addEdge(params, edges)),
    [edges, setEdges]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
    />
  )
}
```

---

## Swimlane Implementation

Swimlanes use React Flow's **group node** feature. A lane is a parent node; child nodes set `parentId` to the lane's ID.

```typescript
// Lane node
const lane: Node = {
  id: 'lane-sales',
  type: 'swimlane',
  position: { x: 0, y: 0 },
  data: { label: 'Sales Team' },
  style: { width: 1200, height: 200 },
}

// Child node inside the lane
const childNode: Node = {
  id: 'node-1',
  type: 'process',
  position: { x: 50, y: 40 },   // Relative to parent
  parentId: 'lane-sales',        // Key: links to lane
  data: { label: 'Qualify Lead' },
}
```

### Lane Reordering

When lanes are reordered (drag handle), update the Y-position of all lane group nodes. Child nodes move automatically because their positions are relative to the parent.

---

## Auto-Layout

Use dagre or ELK.js to compute node positions:

```typescript
import dagre from 'dagre'

function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'LR') {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 })

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 160, height: 60 })
  })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id)
    return { ...node, position: { x: pos.x - 80, y: pos.y - 30 } }
  })

  return { nodes: layoutedNodes, edges }
}
```

---

## Drag & Drop from Palette

```tsx
import { useReactFlow } from '@xyflow/react'

function NodePalette() {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, 'process')}
    >
      Process Step
    </div>
  )
}

// In the canvas component:
function CanvasEditor() {
  const { screenToFlowPosition } = useReactFlow()

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event: DragEvent) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('application/reactflow')
    if (!type) return

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { label: `New ${type}` },
    }

    addNode(newNode)
  }, [screenToFlowPosition])

  return (
    <ReactFlow onDragOver={onDragOver} onDrop={onDrop} ... />
  )
}
```

---

## Key Rules for Agents

1. **Always import from `@xyflow/react`** (not the old `reactflow` package)
2. **Always `memo()` custom nodes and edges**
3. **Use Zustand with selectors** — never subscribe to the full store
4. **Node IDs must be strings** (not numbers)
5. **Position is always `{ x: number, y: number }`** — no shorthand
6. **Use `parentId` for swimlane child nodes** — not custom grouping logic
7. **Include `@xyflow/react/dist/style.css`** in your app for base styles
8. **Wrap `<ReactFlow>` in a container with explicit width/height** — it doesn't size itself

---

## References

- [React Flow Docs](https://reactflow.dev/learn)
- [Custom Nodes](https://reactflow.dev/learn/customization/custom-nodes)
- [Layouting](https://reactflow.dev/learn/layouting/layouting)
- [Sub Flows (Group Nodes)](https://reactflow.dev/examples/layout/sub-flows)
