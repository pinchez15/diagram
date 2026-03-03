'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components';
import { validateDiagramSchema } from '@/lib/schema/validate';

export function ImportForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pasteValue, setPasteValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = useCallback(async (jsonStr: string) => {
    setError(null);
    setLoading(true);
    try {
      const parsed = JSON.parse(jsonStr);
      const validation = validateDiagramSchema(parsed);
      if (!validation.success) {
        setError('Invalid diagram schema. Check the JSON format.');
        return;
      }

      const res = await fetch('/api/diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: validation.data.metadata.title,
          type: validation.data.metadata.type,
          schema_data: validation.data,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Import failed');
      }

      const data = await res.json();
      router.push(`/diagram/${data.id}`);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format.');
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith('.json')) {
      setError('Only .json files are supported.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => handleImport(reader.result as string);
    reader.readAsText(file);
  }, [handleImport]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleImport(reader.result as string);
    reader.readAsText(file);
  }, [handleImport]);

  return (
    <div className="space-y-6">
      {/* File drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center hover:border-brand-primary hover:bg-brand-primary/5 transition-colors"
      >
        <Upload className="mb-3 h-8 w-8 text-neutral-400" />
        <p className="text-sm font-medium text-neutral-700">Drop a .json file here</p>
        <p className="mt-1 text-xs text-neutral-400">or</p>
        <label className="mt-2 cursor-pointer">
          <input type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
          <span className="text-sm font-medium text-brand-primary hover:underline">Browse files</span>
        </label>
      </div>

      {/* Paste area */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Or paste JSON</label>
        <textarea
          value={pasteValue}
          onChange={(e) => setPasteValue(e.target.value)}
          placeholder='{"schema_version": 1, "metadata": {...}, "nodes": [...], "edges": [...]}'
          rows={8}
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
        />
        <div className="mt-2 flex gap-2">
          <Button
            variant="primary"
            size="compact"
            onClick={() => handleImport(pasteValue)}
            disabled={!pasteValue.trim() || loading}
            loading={loading}
          >
            <FileText className="h-3.5 w-3.5" />
            Import JSON
          </Button>
        </div>
      </div>

      {/* Mermaid hint */}
      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-brand-secondary" />
          <span className="text-sm font-medium text-neutral-700">Have a Mermaid diagram?</span>
        </div>
        <p className="text-xs text-neutral-500">
          Use our AI to convert Mermaid syntax to a Diagram. Create a new diagram and use AI Generate with your Mermaid code.
        </p>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
