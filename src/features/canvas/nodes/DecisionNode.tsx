'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData } from '@/types/node';

function DecisionNodeInner({ data, selected }: NodeProps & { data: DiagramNodeData }) {
  return (
    <div className="relative" style={{ width: 100, height: 100 }}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-neutral-400" style={{ left: -4, top: '50%' }} />
      <div
        className={`absolute inset-0 flex items-center justify-center border-2 bg-white transition-shadow
          ${selected ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-neutral-300'}
          hover:shadow-md`}
        style={{ transform: 'rotate(45deg)', borderRadius: 6 }}
      >
        <div className="text-center" style={{ transform: 'rotate(-45deg)' }}>
          <div className="text-xs font-medium text-neutral-900 truncate max-w-[70px]">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-neutral-400" style={{ right: -4, top: '50%' }} />
    </div>
  );
}

export const DecisionNode = memo(DecisionNodeInner);
