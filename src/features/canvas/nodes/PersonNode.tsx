'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData } from '@/types/node';

function PersonNodeInner({ data, selected }: NodeProps & { data: DiagramNodeData }) {
  const initials = data.label
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2 transition-shadow
        ${selected ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-neutral-300'}
        hover:shadow-md`}
      style={{ width: 180, height: 70 }}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-semibold text-brand-primary pointer-events-none">
        {initials}
      </div>
      <div className="min-w-0 flex-1 pointer-events-none">
        <div className="text-sm font-medium text-neutral-900 truncate">{data.label}</div>
        {data.description && (
          <div className="text-xs text-neutral-500 truncate">{data.description}</div>
        )}
      </div>
    </div>
  );
}

export const PersonNode = memo(PersonNodeInner);
