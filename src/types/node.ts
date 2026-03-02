import type { Node } from "@xyflow/react";
import type { NodeType, ToolCategory } from "./diagram";

export interface DiagramNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  toolCategory?: ToolCategory;
  toolName?: string;
}

export type DiagramFlowNode = Node<DiagramNodeData, NodeType>;
