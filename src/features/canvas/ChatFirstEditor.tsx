'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCanvasStore } from '@/stores/canvasStore';
import { CanvasEditor } from './CanvasEditor';
import { ChatFirstToolbar } from './ChatFirstToolbar';
import { EditorSidebar } from './EditorSidebar';
import { NodePalette } from './NodePalette';
import { PropertiesPanel } from './PropertiesPanel';
import { ChatPanel } from './ChatPanel';
import { useLazyDiagramSave } from './useLazyDiagramSave';
import { useAutoLayout } from './useAutoLayout';
import { createEmptySchema } from '@/lib/schema/diagram';
import type { DiagramSchema, DiagramType } from '@/types/diagram';
import type { DiagramFlowNode } from '@/types/node';

interface ChatFirstEditorProps {
  diagramId: string | null;
  initialSchema?: DiagramSchema;
}

export function ChatFirstEditor({ diagramId, initialSchema }: ChatFirstEditorProps) {
  const router = useRouter();
  const schema = initialSchema ?? createEmptySchema('workflow', 'Untitled Diagram');
  const [title, setTitle] = useState(schema.metadata.title);
  const [diagramType] = useState<DiagramType>(schema.metadata.type);
  const [selectedNode, setSelectedNode] = useState<DiagramFlowNode | null>(null);
  const [showPalette, setShowPalette] = useState(false);

  const loadDiagram = useCanvasStore((s) => s.loadDiagram);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const serialize = useCanvasStore((s) => s.serialize);

  const { saveStatus, createAndSave } = useLazyDiagramSave({
    diagramId,
    title,
    diagramType,
  });
  const { applyLayout } = useAutoLayout();

  useEffect(() => {
    loadDiagram(schema);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track selected node
  useEffect(() => {
    const selected = nodes.find((n) => n.selected);
    setSelectedNode(selected || null);
  }, [nodes]);

  const handleDeselectNode = useCallback(() => {
    const selected = nodes.find((n) => n.selected);
    if (selected) {
      onNodesChange([{ id: selected.id, type: 'select', selected: false }]);
    }
  }, [nodes, onNodesChange]);

  const handleExport = useCallback(async (format: string) => {
    if (format === 'json') {
      const s = serialize({ type: diagramType, title });
      const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      try {
        const s = serialize({ type: diagramType, title });
        const res = await fetch(`/api/export/${format}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(s),
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
        // Error handled by toast
      }
    }
  }, [serialize, title, diagramType]);

  // Called after AI generates a diagram — create DB record if new
  const handleDiagramGenerated = useCallback(() => {
    if (!diagramId) {
      createAndSave();
    }
  }, [diagramId, createAndSave]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <ChatFirstToolbar
        title={title}
        onTitleChange={setTitle}
        saveStatus={saveStatus}
        onExport={handleExport}
        onAutoLayout={applyLayout}
        onTogglePalette={() => setShowPalette((v) => !v)}
        paletteActive={showPalette}
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar
          onNewDiagram={() => router.push('/new')}
          currentDiagramId={diagramId}
        />
        {showPalette && <NodePalette />}
        <div className="flex-1">
          <CanvasEditor />
        </div>
        {/* Right panel: Properties replaces Chat when node selected */}
        {selectedNode ? (
          <PropertiesPanel
            selectedNode={selectedNode}
            onClose={handleDeselectNode}
          />
        ) : (
          <ChatPanel
            diagramType={diagramType}
            onDiagramGenerated={handleDiagramGenerated}
          />
        )}
      </div>
    </div>
  );
}
