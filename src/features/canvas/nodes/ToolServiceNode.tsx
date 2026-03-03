'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData } from '@/types/node';
import { getCategoryColor } from './categoryColors';

function ToolServiceNodeInner({ data, selected }: NodeProps & { data: DiagramNodeData }) {
  const colors = getCategoryColor(data.toolCategory);
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-shadow transition-colors cursor-grab active:cursor-grabbing
        ${selected ? 'border-brand-primary ring-2 ring-brand-primary/30' : `${colors.border} hover:border-brand-primary/50`}
        ${colors.bg} hover:shadow-md`}
      style={{ width: 160, height: 60 }}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
      <div className="min-w-0 flex-1 pointer-events-none">
        <div className="font-medium text-neutral-900 truncate">{data.label}</div>
        {data.toolName && (
          <div className={`text-xs truncate ${colors.text}`}>{data.toolName}</div>
        )}
      </div>
    </div>
  );
}

export const ToolServiceNode = memo(ToolServiceNodeInner);
