'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { ChatFirstEditor } from './ChatFirstEditor';
import type { DiagramSchema } from '@/types/diagram';

interface DiagramEditorWrapperProps {
  diagramId: string;
  initialSchema: DiagramSchema;
}

export function DiagramEditorWrapper({ diagramId, initialSchema }: DiagramEditorWrapperProps) {
  return (
    <ReactFlowProvider>
      <ChatFirstEditor diagramId={diagramId} initialSchema={initialSchema} />
    </ReactFlowProvider>
  );
}
