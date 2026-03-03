'use client';

import { memo, useState } from 'react';
import { type NodeProps } from '@xyflow/react';
import type { DiagramNodeData } from '@/types/node';

function SwimlaneNodeInner({ data, selected }: NodeProps & { data: DiagramNodeData }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      className={`rounded-lg border bg-neutral-50/50 transition-shadow transition-colors
        ${selected ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-neutral-200 hover:border-brand-primary/50'}
        hover:shadow-sm`}
      style={{ width: '100%', minWidth: 600, minHeight: collapsed ? 48 : 200 }}
    >
      <div
        className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-100 px-3 py-2 rounded-t-lg cursor-grab"
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-neutral-400 hover:text-neutral-600 text-xs"
        >
          {collapsed ? '\u25B6' : '\u25BC'}
        </button>
        <span className="text-sm font-semibold text-neutral-700">{data.label}</span>
      </div>
      {!collapsed && (
        <div className="p-4" style={{ minHeight: 150 }} />
      )}
    </div>
  );
}

export const SwimlaneNode = memo(SwimlaneNodeInner);
