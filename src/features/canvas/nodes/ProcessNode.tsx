'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData } from '@/types/node';

function ProcessNodeInner({ data, selected }: NodeProps & { data: DiagramNodeData }) {
  return (
    <div
      className={`flex items-center justify-center rounded-md border bg-white px-4 py-2 text-sm transition-shadow
        ${selected ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-neutral-300'}
        hover:shadow-md`}
      style={{ width: 160, height: 60 }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-neutral-400" />
      <div className="text-center truncate">
        <div className="font-medium text-neutral-900 truncate">{data.label}</div>
        {data.description && (
          <div className="text-xs text-neutral-500 truncate">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-neutral-400" />
    </div>
  );
}

export const ProcessNode = memo(ProcessNodeInner);
