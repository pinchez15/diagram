'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { NodeType } from '@/types/diagram';

interface PaletteItem {
  type: NodeType;
  label: string;
  category: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'startEnd', label: 'Start / End', category: 'Flow' },
  { type: 'process', label: 'Process', category: 'Flow' },
  { type: 'decision', label: 'Decision', category: 'Flow' },
  { type: 'handoff', label: 'Handoff', category: 'Flow' },
  { type: 'person', label: 'Person', category: 'People' },
  { type: 'toolService', label: 'Tool / Service', category: 'Integration' },
  { type: 'dataStore', label: 'Data Store', category: 'Integration' },
];

const CATEGORIES = ['Flow', 'People', 'Integration'];

const NODE_SHAPES: Record<NodeType, string> = {
  process: 'w-6 h-4 rounded border border-neutral-400 bg-white',
  decision: 'w-4 h-4 rotate-45 border border-neutral-400 bg-white',
  toolService: 'w-6 h-4 rounded-lg border-2 border-blue-400 bg-blue-50',
  dataStore: 'w-6 h-4 rounded border border-blue-400 bg-blue-50 border-t-2',
  person: 'w-5 h-5 rounded-full border border-neutral-400 bg-neutral-100',
  startEnd: 'w-6 h-3 rounded-full border border-neutral-400 bg-neutral-100',
  handoff: 'w-5 h-3 rounded border-2 border-brand-primary bg-brand-primary/10',
};

export function NodePalette() {
  const [expanded, setExpanded] = useState(false);

  const onDragStart = (event: React.DragEvent, item: PaletteItem) => {
    event.dataTransfer.setData('application/reactflow-type', item.type);
    event.dataTransfer.setData('application/reactflow-label', item.label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`flex flex-col border-r border-neutral-200 bg-white transition-all ${
        expanded ? 'w-60' : 'w-12'
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex h-10 items-center justify-center border-b border-neutral-200 text-neutral-400 hover:text-neutral-600"
      >
        {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {expanded ? (
        <div className="flex-1 overflow-y-auto p-3">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase text-neutral-400">{cat}</h3>
              <div className="space-y-1">
                {PALETTE_ITEMS.filter((i) => i.category === cat).map((item) => (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, item)}
                    className="flex cursor-grab items-center gap-3 rounded-md px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 active:cursor-grabbing"
                  >
                    <div className={NODE_SHAPES[item.type]} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-2 pt-3">
          {PALETTE_ITEMS.slice(0, 5).map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              className="cursor-grab rounded p-1.5 hover:bg-neutral-100 active:cursor-grabbing"
              title={item.label}
            >
              <div className={NODE_SHAPES[item.type]} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
