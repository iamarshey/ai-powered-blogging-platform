import { NextResponse } from 'next/server';
import { askDocumentRAG } from '@/lib/ai/rag/qa';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { question } = await req.json();
    if (!question) return NextResponse.json({ error: 'Question is required' }, { status: 400 });

    const result = await askDocumentRAG(params.id, question);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
