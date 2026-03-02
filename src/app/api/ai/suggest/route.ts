import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Backend Agent will implement: contextual AI suggestions from selected nodes
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  );
}
