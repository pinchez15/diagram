// Shared DiagramSchema contract — changes affect Frontend, Backend, and UI layers.
// See docs/skills/DiagramSchema.md for change rules.

export type NodeType =
  | "process"
  | "decision"
  | "toolService"
  | "dataStore"
  | "person"
  | "startEnd"
  | "handoff";

export type ToolCategory =
  | "database"
  | "payments"
  | "crm"
  | "communication"
  | "analytics"
  | "storage"
  | "api";

export type DiagramType = "orgchart" | "workflow" | "swimlane";

export type EdgeStyle = "solid" | "dashed" | "dotted";

export interface DiagramMetadata {
  type: DiagramType;
  title: string;
  description?: string;
}

export interface DiagramNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  position: { x: number; y: number };
  parentId?: string;
  data?: Record<string, unknown>;
  toolCategory?: ToolCategory;
  toolName?: string;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: EdgeStyle;
}

export interface DiagramLane {
  id: string;
  label: string;
  order: number;
  collapsed?: boolean;
  nodeIds: string[];
}

export interface DiagramSchema {
  schema_version: number;
  metadata: DiagramMetadata;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  lanes?: DiagramLane[];
}
