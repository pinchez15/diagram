'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Dialog, Button } from '@/components';
import { useAIGenerate } from './useAIGenerate';
import type { DiagramType } from '@/types/diagram';

const DIAGRAM_TYPES: { value: DiagramType; label: string }[] = [
  { value: 'workflow', label: 'Workflow' },
  { value: 'orgchart', label: 'Org Chart' },
  { value: 'swimlane', label: 'Swimlane' },
];

interface GenerateDialogProps {
  open: boolean;
  onClose: () => void;
}

export function GenerateDialog({ open, onClose }: GenerateDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<DiagramType>('workflow');
  const { generate, loading, error } = useAIGenerate();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const result = await generate(prompt, type);
    if (result) {
      onClose();
      setPrompt('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="AI Generate Diagram">
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700">Diagram Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as DiagramType)}
            className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {DIAGRAM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700">Describe your diagram</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Customer onboarding workflow for a SaaS product with Stripe billing, email notifications via SendGrid, and data stored in PostgreSQL..."
            rows={5}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-error">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="ai" onClick={handleGenerate} loading={loading} disabled={!prompt.trim()}>
            <Sparkles className="h-4 w-4" />
            Generate
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
