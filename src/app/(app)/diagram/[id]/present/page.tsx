export default async function PresentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <p className="text-neutral-500">
        Presentation mode for diagram <code className="font-mono">{id}</code> — Frontend Agent will implement.
      </p>
    </div>
  );
}
