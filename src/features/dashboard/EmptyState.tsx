import Link from 'next/link';
import { FileText, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <FileText className="h-8 w-8 text-neutral-400" />
      </div>
      <h2 className="text-lg font-semibold text-neutral-900">No diagrams yet</h2>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">
        Create your first diagram from scratch, use a template, or import an existing one.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link href="/dashboard?new=true">
          <Button variant="primary" icon={<Sparkles className="h-4 w-4" />}>
            New Diagram
          </Button>
        </Link>
        <Link href="/templates">
          <Button variant="secondary">Templates</Button>
        </Link>
        <Link href="/import">
          <Button variant="ghost" icon={<Upload className="h-4 w-4" />}>
            Import
          </Button>
        </Link>
      </div>
    </div>
  );
}
