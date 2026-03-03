import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { validateDiagramSchema } from '@/lib/schema/validate';
import { diagramToMermaid } from '@/features/export/mermaidExport';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ format: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { format } = await params;
  const body = await request.json();
  const validation = validateDiagramSchema(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid diagram schema' }, { status: 400 });
  }

  const schema = validation.data;

  switch (format) {
    case 'json': {
      const json = JSON.stringify(schema, null, 2);
      return new NextResponse(json, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${schema.metadata.title.replace(/\s+/g, '-')}.json"`,
        },
      });
    }
    case 'mermaid': {
      const mermaid = diagramToMermaid(schema);
      return new NextResponse(mermaid, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${schema.metadata.title.replace(/\s+/g, '-')}.mmd"`,
        },
      });
    }
    case 'png':
    case 'svg':
    case 'pdf':
      return NextResponse.json(
        { error: `${format.toUpperCase()} export is handled client-side` },
        { status: 501 }
      );
    default:
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  }
}
