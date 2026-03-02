import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
        <span className="text-lg font-semibold text-foreground">Diagram</span>
        <nav className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm text-neutral-600 hover:text-foreground">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <a
              href="/dashboard"
              className="text-sm text-neutral-600 hover:text-foreground"
            >
              Dashboard
            </a>
            <UserButton />
          </SignedIn>
        </nav>
      </header>
      {children}
    </div>
  );
}
