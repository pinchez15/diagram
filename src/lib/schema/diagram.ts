import type { DiagramSchema, DiagramNode, DiagramEdge, DiagramLane } from "@/types/diagram";
import type { DiagramFlowNode } from "@/types/node";
import type { DiagramFlowEdge } from "@/types/edge";

// Default dimensions for auto-layout calculations
const NODE_WIDTH = 160;
const NODE_HEIGHT = 60;
const LANE_PADDING = 20;

function nodeToFlowNode(node: DiagramNode): DiagramFlowNode {
  return {
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
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  };
}

function laneToFlowNode(lane: DiagramLane, index: number): DiagramFlowNode {
  return {
    id: lane.id,
    type: "swimlane" as DiagramFlowNode["type"],
    position: { x: 0, y: index * (NODE_HEIGHT * 3 + LANE_PADDING) },
    data: {
      label: lane.label,
      collapsed: lane.collapsed,
    },
    style: {
      width: 800,
      height: NODE_HEIGHT * 3,
    },
  };
}

function edgeToFlowEdge(edge: DiagramEdge): DiagramFlowEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: edge.animated,
    type: "default",
    data: {
      style: edge.style,
    },
  };
}

export function schemaToReactFlow(schema: DiagramSchema): {
  nodes: DiagramFlowNode[];
  edges: DiagramFlowEdge[];
} {
  const flowNodes: DiagramFlowNode[] = [];

  // Convert lanes to group nodes first (they must appear before children)
  if (schema.lanes) {
    schema.lanes
      .sort((a, b) => a.order - b.order)
      .forEach((lane, index) => {
        flowNodes.push(laneToFlowNode(lane, index));
      });
  }

  // Convert diagram nodes to flow nodes
  for (const node of schema.nodes) {
    flowNodes.push(nodeToFlowNode(node));
  }

  // Convert edges
  const flowEdges = schema.edges.map(edgeToFlowEdge);

  return { nodes: flowNodes, edges: flowEdges };
}

export function reactFlowToSchema(
  nodes: DiagramFlowNode[],
  edges: DiagramFlowEdge[],
  metadata: DiagramSchema["metadata"]
): DiagramSchema {
  const lanes: DiagramLane[] = [];
  const diagramNodes: DiagramNode[] = [];

  for (const node of nodes) {
    if ((node.type as string) === "swimlane") {
      lanes.push({
        id: node.id,
        label: node.data.label,
        order: lanes.length,
        collapsed: node.data.collapsed as boolean | undefined,
        nodeIds: nodes
          .filter((n) => n.parentId === node.id)
          .map((n) => n.id),
      });
    } else {
      diagramNodes.push({
        id: node.id,
        type: node.type as DiagramNode["type"],
        label: node.data.label,
        description: node.data.description,
        position: node.position,
        parentId: node.parentId,
        toolCategory: node.data.toolCategory,
        toolName: node.data.toolName,
      });
    }
  }

  const diagramEdges: DiagramEdge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label as string | undefined,
    animated: edge.animated,
    style: edge.data?.style,
  }));

  return {
    schema_version: 1,
    metadata,
    nodes: diagramNodes,
    edges: diagramEdges,
    ...(lanes.length > 0 ? { lanes } : {}),
  };
}

export function createEmptySchema(
  type: DiagramSchema["metadata"]["type"],
  title: string
): DiagramSchema {
  return {
    schema_version: 1,
    metadata: { type, title },
    nodes: [],
    edges: [],
  };
}
