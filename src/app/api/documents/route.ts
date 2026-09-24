import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { processDocumentUpload } from '@/lib/documents/processor';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const documents = await db.document.findMany({
      where: user.role === 'ADMIN' ? undefined : { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { chunks: true } } },
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'AUTHOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Author role required' }, { status: 403 });
    }

    const { title, fileContent, fileType, sizeBytes } = await req.json();
    if (!title || !fileContent) {
      return NextResponse.json({ error: 'Title and fileContent are required' }, { status: 400 });
    }

    const document = await db.document.create({
      data: {
        title,
        fileUrl: `/uploads/${title}`,
        fileType: fileType || 'txt',
        sizeBytes: sizeBytes || fileContent.length,
        status: 'PENDING',
        userId: user.userId,
      },
    });

    // Start background processing pipeline
    setTimeout(() => {
      processDocumentUpload(document.id, fileContent);
    }, 0);

    return NextResponse.json({ success: true, document });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
