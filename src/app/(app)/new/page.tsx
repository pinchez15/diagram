'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { ChatFirstEditor } from '@/features/canvas/ChatFirstEditor';

export default function NewDiagramPage() {
  return (
    <ReactFlowProvider>
      <ChatFirstEditor diagramId={null} />
    </ReactFlowProvider>
  );
}
