import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const VALID_FORMATS = ["png", "svg", "pdf", "json", "mermaid"] as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ format: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { format } = await params;

  if (!VALID_FORMATS.includes(format as (typeof VALID_FORMATS)[number])) {
    return NextResponse.json(
      { error: `Invalid format. Valid formats: ${VALID_FORMATS.join(", ")}` },
      { status: 400 }
    );
  }

  // Backend Agent will implement: server-side rendering for each format
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  );
}
