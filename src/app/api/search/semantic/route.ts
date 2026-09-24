import { NextResponse } from 'next/server';
import { executeHybridSearch } from '@/lib/ai/retrieval/hybrid';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const hybridResults = await executeHybridSearch(q, 10);
    return NextResponse.json({ results: hybridResults });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
