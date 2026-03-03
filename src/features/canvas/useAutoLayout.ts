'use client';

import { useCallback } from 'react';
import dagre from 'dagre';
import { useReactFlow } from '@xyflow/react';
import { useCanvasStore } from '@/stores/canvasStore';

export function useAutoLayout() {
  const { fitView } = useReactFlow();

  const applyLayout = useCallback(() => {
    const { nodes, edges, pushSnapshot } = useCanvasStore.getState();
    if (nodes.length === 0) return;

    pushSnapshot();

    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100 });

    const regularNodes = nodes.filter((n) => (n.type as string) !== 'swimlane');

    for (const node of regularNodes) {
      g.setNode(node.id, { width: 160, height: 60 });
    }

    for (const edge of edges) {
      if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
        g.setEdge(edge.source, edge.target);
      }
    }

    dagre.layout(g);

    const layoutedNodes = nodes.map((node) => {
      if ((node.type as string) === 'swimlane') return node;
      const dagreNode = g.node(node.id);
      if (!dagreNode) return node;
      return {
        ...node,
        position: { x: dagreNode.x - 80, y: dagreNode.y - 30 },
      };
    });

    useCanvasStore.setState({ nodes: layoutedNodes });
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  }, [fitView]);

  return { applyLayout };
}
