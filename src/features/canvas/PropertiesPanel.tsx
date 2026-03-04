'use client';

import { useCallback } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components';
import { useCanvasStore } from '@/stores/canvasStore';
import type { DiagramFlowNode } from '@/types/node';
import type { ToolCategory } from '@/types/diagram';

const TOOL_CATEGORIES: ToolCategory[] = ['database', 'payments', 'crm', 'communication', 'analytics', 'storage', 'api'];

interface PropertiesPanelProps {
  selectedNode: DiagramFlowNode | null;
  onClose: () => void;
}

export function PropertiesPanel({ selectedNode, onClose }: PropertiesPanelProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);

  const handleChange = useCallback(
    (field: string, value: string) => {
      if (!selectedNode) return;
      updateNodeData(selectedNode.id, { [field]: value || undefined });
    },
    [selectedNode, updateNodeData]
  );

  if (!selectedNode) return null;

  return (
    <div className="flex w-[360px] flex-col border-l border-neutral-200 bg-white">
      <div className="flex h-10 items-center justify-between border-b border-neutral-200 px-3">
        <span className="text-sm font-semibold text-neutral-700">Properties</span>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <Input
          label="Label"
          value={selectedNode.data.label}
          onChange={(e) => handleChange('label', e.target.value)}
        />
        <Input
          label="Description"
          value={selectedNode.data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
        />
        {(selectedNode.type === 'toolService' || selectedNode.type === 'dataStore') && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-700">Category</label>
              <select
                className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                value={selectedNode.data.toolCategory || ''}
                onChange={(e) => handleChange('toolCategory', e.target.value)}
              >
                <option value="">None</option>
                {TOOL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <Input
              label="Tool Name"
              value={selectedNode.data.toolName || ''}
              onChange={(e) => handleChange('toolName', e.target.value)}
            />
          </>
        )}
        <div className="border-t border-neutral-200 pt-3">
          <p className="text-xs text-neutral-400">Type: {selectedNode.type}</p>
          <p className="text-xs text-neutral-400">ID: {selectedNode.id}</p>
        </div>
      </div>
    </div>
  );
}
