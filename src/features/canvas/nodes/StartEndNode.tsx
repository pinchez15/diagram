'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData } from '@/types/node';

function StartEndNodeInner({ data, selected }: NodeProps & { data: DiagramNodeData }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full border bg-neutral-100 px-4 py-2 text-sm transition-shadow transition-colors cursor-grab active:cursor-grabbing
        ${selected ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-neutral-300 hover:border-brand-primary/50'}
        hover:shadow-md`}
      style={{ width: 120, height: 40 }}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
      <span className="font-medium text-neutral-700 pointer-events-none">{data.label}</span>
    </div>
  );
}

export const StartEndNode = memo(StartEndNodeInner);
