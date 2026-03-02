import type { Edge } from "@xyflow/react";
import type { EdgeStyle } from "./diagram";

export interface DiagramEdgeData extends Record<string, unknown> {
  style?: EdgeStyle;
}

export type DiagramFlowEdge = Edge<DiagramEdgeData>;
