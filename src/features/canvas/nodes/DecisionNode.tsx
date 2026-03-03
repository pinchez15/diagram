'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData } from '@/types/node';

function DecisionNodeInner({ data, selected }: NodeProps & { data: DiagramNodeData }) {
  return (
    <div className="relative cursor-grab active:cursor-grabbing" style={{ width: 100, height: 100 }}>
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
      <div
        className={`absolute inset-[8px] flex items-center justify-center border-2 bg-white transition-shadow transition-colors
          ${selected ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-neutral-300 hover:border-brand-primary/50'}
          hover:shadow-md`}
        style={{ transform: 'rotate(45deg)', borderRadius: 4 }}
      >
        <div className="text-center pointer-events-none" style={{ transform: 'rotate(-45deg)' }}>
          <div className="text-xs font-medium text-neutral-900 truncate max-w-[60px]">{data.label}</div>
        </div>
      </div>
    </div>
  );
}

export const DecisionNode = memo(DecisionNodeInner);
