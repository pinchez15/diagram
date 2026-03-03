'use client';

import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components';
import { TEMPLATES } from '@/features/templates/templateData';

const TYPE_BADGES: Record<string, string> = {
  workflow: 'bg-blue-100 text-blue-700',
  orgchart: 'bg-green-100 text-green-700',
  swimlane: 'bg-purple-100 text-purple-700',
};

export default function TemplatesPage() {
  const router = useRouter();

  const handleUseTemplate = async (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const res = await fetch('/api/diagrams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: template.name,
        type: template.type,
        canvas_data: template.schema,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/diagram/${data.id}`);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Templates</h1>
        <p className="mt-1 text-sm text-neutral-500">Start with a pre-built diagram and customize it.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <div className="mb-3 flex h-20 items-center justify-center rounded bg-neutral-100 text-neutral-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="8" y="14" width="7" height="7" rx="1" />
                <path d="M10 7h4M6.5 10v7.5M17.5 10v4" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium text-neutral-900">{template.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGES[template.type]}`}>
                  {template.type}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mb-3">{template.description}</p>
            </div>
            <Button variant="secondary" size="compact" className="w-full" onClick={() => handleUseTemplate(template.id)}>
              Use Template
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
