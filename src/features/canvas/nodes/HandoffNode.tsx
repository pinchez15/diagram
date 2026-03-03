'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData } from '@/types/node';

function HandoffNodeInner({ data, selected }: NodeProps & { data: DiagramNodeData }) {
  return (
    <div
      className={`flex items-center justify-center rounded-md border-2 bg-brand-primary/10 px-3 py-2 text-sm transition-shadow transition-colors cursor-grab active:cursor-grabbing
        ${selected ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-brand-primary hover:border-brand-primary/70'}
        hover:shadow-md`}
      style={{ width: 100, height: 40 }}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
      <span className="font-medium text-brand-primary truncate pointer-events-none">{data.label}</span>
    </div>
  );
}

export const HandoffNode = memo(HandoffNodeInner);
