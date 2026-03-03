'use client';

import { ReactFlow, ReactFlowProvider, Background } from '@xyflow/react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { nodeTypes } from '@/features/canvas/nodes';
import { schemaToReactFlow } from '@/lib/schema/diagram';
import type { DiagramSchema } from '@/types/diagram';

interface PresentationViewProps {
  schema: DiagramSchema;
  diagramId: string;
}

function PresentationInner({ schema, diagramId }: PresentationViewProps) {
  const { nodes, edges } = schemaToReactFlow(schema);

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="absolute right-4 top-4 z-10">
        <Link
          href={`/diagram/${diagramId}`}
          className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600 shadow-sm hover:bg-neutral-50"
        >
          <X className="h-4 w-4" />
          Exit
        </Link>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
      >
        <Background gap={20} size={1} color="var(--neutral-200)" />
      </ReactFlow>
    </div>
  );
}

export function PresentationView(props: PresentationViewProps) {
  return (
    <ReactFlowProvider>
      <PresentationInner {...props} />
    </ReactFlowProvider>
  );
}
