export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center px-6 py-24">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        AI-Powered Workflow Diagrams
      </h1>
      <p className="mt-4 max-w-md text-center text-lg text-neutral-500">
        Go from zero to a full, editable diagram in under 60 seconds.
      </p>
      <a
        href="/sign-up"
        className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-medium text-white hover:opacity-90"
      >
        Start free trial
      </a>
    </main>
  );
}
