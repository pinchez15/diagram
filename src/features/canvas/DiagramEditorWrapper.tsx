'use client';

import { useEffect, useState, useCallback } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { useCanvasStore } from '@/stores/canvasStore';
import { CanvasEditor } from './CanvasEditor';
import { Toolbar } from './Toolbar';
import { NodePalette } from './NodePalette';
import { PropertiesPanel } from './PropertiesPanel';
import { GenerateDialog } from './GenerateDialog';
import { useAutoSave } from './useAutoSave';
import { useAutoLayout } from './useAutoLayout';
import type { DiagramSchema } from '@/types/diagram';
import type { DiagramFlowNode } from '@/types/node';

interface DiagramEditorWrapperProps {
  diagramId: string;
  initialSchema: DiagramSchema;
}

function EditorInner({ diagramId, initialSchema }: DiagramEditorWrapperProps) {
  const [title, setTitle] = useState(initialSchema.metadata.title);
  const [selectedNode, setSelectedNode] = useState<DiagramFlowNode | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);

  const loadDiagram = useCanvasStore((s) => s.loadDiagram);
  const nodes = useCanvasStore((s) => s.nodes);
  const serialize = useCanvasStore((s) => s.serialize);

  const { saveStatus } = useAutoSave(diagramId, title);
  const { applyLayout } = useAutoLayout();

  useEffect(() => {
    loadDiagram(initialSchema);
  }, [initialSchema, loadDiagram]);

  // Track selected node
  useEffect(() => {
    const selected = nodes.find((n) => n.selected);
    setSelectedNode(selected || null);
  }, [nodes]);

  const handleExport = useCallback(async (format: string) => {
    if (format === 'json') {
      const schema = serialize({ type: initialSchema.metadata.type, title });
      const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For other formats, call the export API
      try {
        const schema = serialize({ type: initialSchema.metadata.type, title });
        const res = await fetch(`/api/export/${format}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(schema),
        });
        if (!res.ok) throw new Error('Export failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        // Toast error handled by caller
      }
    }
  }, [serialize, title, initialSchema.metadata.type]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <Toolbar
        title={title}
        onTitleChange={setTitle}
        saveStatus={saveStatus}
        onAIGenerate={() => setShowGenerate(true)}
        onExport={handleExport}
        onAutoLayout={applyLayout}
      />
      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        <div className="flex-1">
          <CanvasEditor />
        </div>
        <PropertiesPanel
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>
      <GenerateDialog open={showGenerate} onClose={() => setShowGenerate(false)} />
    </div>
  );
}

export function DiagramEditorWrapper(props: DiagramEditorWrapperProps) {
  return (
    <ReactFlowProvider>
      <EditorInner {...props} />
    </ReactFlowProvider>
  );
}
