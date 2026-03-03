'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData } from '@/types/node';

function HandoffNodeInner({ data, selected }: NodeProps & { data: DiagramNodeData }) {
  return (
    <div
      className={`flex items-center justify-center rounded-md border-2 border-brand-primary bg-brand-primary/10 px-3 py-2 text-sm transition-shadow
        ${selected ? 'ring-2 ring-brand-primary/30' : ''}
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
