'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData } from '@/types/node';
import { getCategoryColor } from './categoryColors';

function DataStoreNodeInner({ data, selected }: NodeProps & { data: DiagramNodeData }) {
  const colors = getCategoryColor(data.toolCategory);
  return (
    <div
      className={`overflow-hidden rounded-lg border bg-white transition-shadow transition-colors cursor-grab active:cursor-grabbing
        ${selected ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-neutral-300 hover:border-brand-primary/50'}
        hover:shadow-md`}
      style={{ width: 160, height: 60 }}
    >
      <div style={{ height: 4, backgroundColor: `var(--category-${data.toolCategory || 'database'})` }} />
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
      <div className="flex items-center justify-center px-3 py-2 pointer-events-none">
        <div className="text-center truncate">
          <div className="text-sm font-medium text-neutral-900 truncate">{data.label}</div>
          {data.description && (
            <div className="text-xs text-neutral-500 truncate">{data.description}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export const DataStoreNode = memo(DataStoreNodeInner);
