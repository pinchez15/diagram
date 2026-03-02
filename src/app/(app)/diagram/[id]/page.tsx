export default async function DiagramEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-neutral-500">
        Canvas editor for diagram <code className="font-mono">{id}</code> — Frontend Agent will implement.
      </p>
    </div>
  );
}
