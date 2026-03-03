'use client';

import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  ConnectionMode,
  type ReactFlowInstance,
  type Connection,
} from '@xyflow/react';
import { useCanvasStore } from '@/stores/canvasStore';
import { nodeTypes } from '@/features/canvas/nodes';
import type { DiagramFlowNode } from '@/types/node';
import type { DiagramFlowEdge } from '@/types/edge';
import type { NodeType } from '@/types/diagram';

export function CanvasEditor() {
  const reactFlowRef = useRef<ReactFlowInstance<DiagramFlowNode, DiagramFlowEdge> | null>(null);

  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);
  const addNode = useCanvasStore((s) => s.addNode);
  const setViewport = useCanvasStore((s) => s.setViewport);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow-type') as NodeType;
      const label = event.dataTransfer.getData('application/reactflow-label') || type;
      if (!type || !reactFlowRef.current) return;

      const position = reactFlowRef.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: DiagramFlowNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        position,
        data: { label },
      };

      addNode(newNode);
    },
    [addNode]
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect as (connection: Connection) => void}
        onInit={(instance) => { reactFlowRef.current = instance; }}
        onMoveEnd={(_, viewport) => setViewport(viewport)}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        snapToGrid
        snapGrid={[10, 10]}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        className="bg-neutral-50"
      >
        <Background gap={20} size={1} color="var(--neutral-200)" />
        <MiniMap
          position="bottom-left"
          className="!bg-white !border-neutral-200"
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        <Controls
          position="bottom-left"
          className="!border-neutral-200 !bg-white !shadow-sm"
          style={{ left: 10, bottom: 130 }}
        />
      </ReactFlow>
    </div>
  );
}
