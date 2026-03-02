import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Backend Agent will implement: Claude API call + Zod validation + usage tracking
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  );
}
