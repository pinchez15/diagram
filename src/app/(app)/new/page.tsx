'use client';

import { useSearchParams } from 'next/navigation';
import { ReactFlowProvider } from '@xyflow/react';
import { ChatFirstEditor } from '@/features/canvas/ChatFirstEditor';
import { TEMPLATES } from '@/features/templates/templateData';

export default function NewDiagramPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const template = templateId
    ? TEMPLATES.find((t) => t.id === templateId)
    : undefined;

  return (
    <ReactFlowProvider>
      <ChatFirstEditor
        diagramId={null}
        initialSchema={template?.schema}
      />
    </ReactFlowProvider>
  );
}
