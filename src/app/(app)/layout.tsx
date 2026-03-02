import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder — UI Agent will implement */}
      <aside className="hidden w-60 border-r border-neutral-200 bg-neutral-50 lg:block">
        <div className="p-4">
          <span className="text-sm font-semibold text-foreground">Diagram</span>
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
