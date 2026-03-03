import { create } from "zustand";
import {
  type Viewport,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import type { DiagramFlowNode } from "@/types/node";
import type { DiagramFlowEdge } from "@/types/edge";
import type { DiagramSchema } from "@/types/diagram";
import { schemaToReactFlow, reactFlowToSchema } from "@/lib/schema/diagram";

const MAX_UNDO_STACK = 50;

interface CanvasSnapshot {
  nodes: DiagramFlowNode[];
  edges: DiagramFlowEdge[];
}

interface CanvasState {
  // State
  nodes: DiagramFlowNode[];
  edges: DiagramFlowEdge[];
  viewport: Viewport;
  undoStack: CanvasSnapshot[];
  redoStack: CanvasSnapshot[];

  // React Flow event handlers
  onNodesChange: OnNodesChange<DiagramFlowNode>;
  onEdgesChange: OnEdgesChange<DiagramFlowEdge>;
  onConnect: OnConnect;

  // Actions
  addNode: (node: DiagramFlowNode) => void;
  removeNodes: (ids: string[]) => void;
  updateNodeData: (id: string, data: Partial<DiagramFlowNode["data"]>) => void;
  updateEdgeData: (id: string, data: Partial<DiagramFlowEdge["data"]>) => void;
  setViewport: (viewport: Viewport) => void;

  // Undo/Redo
  pushSnapshot: () => void;
  undo: () => void;
  redo: () => void;

  // Serialization
  loadDiagram: (schema: DiagramSchema) => void;
  serialize: (metadata: DiagramSchema["metadata"]) => DiagramSchema;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  undoStack: [],
  redoStack: [],

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as DiagramFlowNode[] });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) as DiagramFlowEdge[] });
  },

  onConnect: (connection) => {
    get().pushSnapshot();
    set({ edges: addEdge(connection, get().edges) as DiagramFlowEdge[] });
  },

  addNode: (node) => {
    get().pushSnapshot();
    set({ nodes: [...get().nodes, node] });
  },

  removeNodes: (ids) => {
    get().pushSnapshot();
    const idSet = new Set(ids);
    set({
      nodes: get().nodes.filter((n) => !idSet.has(n.id)),
      edges: get().edges.filter(
        (e) => !idSet.has(e.source) && !idSet.has(e.target)
      ),
    });
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    });
  },

  updateEdgeData: (id, data) => {
    set({
      edges: get().edges.map((e) =>
        e.id === id ? { ...e, data: { ...e.data, ...data } } : e
      ),
    });
  },

  setViewport: (viewport) => set({ viewport }),

  pushSnapshot: () => {
    const { nodes, edges, undoStack } = get();
    const snapshot: CanvasSnapshot = {
      nodes: structuredClone(nodes),
      edges: structuredClone(edges),
    };
    const newStack = [...undoStack, snapshot];
    if (newStack.length > MAX_UNDO_STACK) newStack.shift();
    set({ undoStack: newStack, redoStack: [] });
  },

  undo: () => {
    const { undoStack, nodes, edges } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [
        ...get().redoStack,
        { nodes: structuredClone(nodes), edges: structuredClone(edges) },
      ],
      nodes: prev.nodes,
      edges: prev.edges,
    });
  },

  redo: () => {
    const { redoStack, nodes, edges } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [
        ...get().undoStack,
        { nodes: structuredClone(nodes), edges: structuredClone(edges) },
      ],
      nodes: next.nodes,
      edges: next.edges,
    });
  },

  loadDiagram: (schema) => {
    const { nodes, edges } = schemaToReactFlow(schema);
    set({
      nodes: nodes as DiagramFlowNode[],
      edges: edges as DiagramFlowEdge[],
      undoStack: [],
      redoStack: [],
    });
  },

  serialize: (metadata) => {
    return reactFlowToSchema(get().nodes, get().edges, metadata);
  },
}));
