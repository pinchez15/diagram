'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData } from '@/types/node';

function StartEndNodeInner({ data, selected }: NodeProps & { data: DiagramNodeData }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full border bg-neutral-100 px-4 py-2 text-sm transition-shadow
        ${selected ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-neutral-300'}
        hover:shadow-md`}
      style={{ width: 120, height: 40 }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-neutral-400" />
      <span className="font-medium text-neutral-700">{data.label}</span>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-neutral-400" />
    </div>
  );
}

export const StartEndNode = memo(StartEndNodeInner);
