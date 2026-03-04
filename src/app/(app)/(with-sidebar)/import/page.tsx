import { ImportForm } from '@/features/import/ImportForm';

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-semibold text-neutral-900">Import</h1>
      <p className="mb-6 text-sm text-neutral-500">Import diagrams from JSON files.</p>
      <ImportForm />
    </div>
  );
}
