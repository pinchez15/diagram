'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData } from '@/types/node';

function ProcessNodeInner({ data, selected }: NodeProps & { data: DiagramNodeData }) {
  return (
    <div
      className={`flex items-center justify-center rounded-md border bg-white px-4 py-2 text-sm transition-shadow transition-colors cursor-grab active:cursor-grabbing
        ${selected ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-neutral-300 hover:border-brand-primary/50'}
        hover:shadow-md`}
      style={{ width: 160, height: 60 }}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
      <div className="text-center truncate pointer-events-none">
        <div className="font-medium text-neutral-900 truncate">{data.label}</div>
        {data.description && (
          <div className="text-xs text-neutral-500 truncate">{data.description}</div>
        )}
      </div>
    </div>
  );
}

export const ProcessNode = memo(ProcessNodeInner);
