'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData } from '@/types/node';
import { getCategoryColor } from './categoryColors';

function DataStoreNodeInner({ data, selected }: NodeProps & { data: DiagramNodeData }) {
  const colors = getCategoryColor(data.toolCategory);
  return (
    <div
      className={`overflow-hidden rounded-lg border bg-white transition-shadow
        ${selected ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-neutral-300'}
        hover:shadow-md`}
      style={{ width: 160, height: 60 }}
    >
      <div className={`h-1.5 ${colors.border.replace('border', 'bg')}`} style={{ backgroundColor: `var(--category-${data.toolCategory || 'database'})` }} />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-neutral-400" />
      <div className="flex items-center justify-center px-3 py-2">
        <div className="text-center truncate">
          <div className="text-sm font-medium text-neutral-900 truncate">{data.label}</div>
          {data.description && (
            <div className="text-xs text-neutral-500 truncate">{data.description}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-neutral-400" />
    </div>
  );
}

export const DataStoreNode = memo(DataStoreNodeInner);
