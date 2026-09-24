import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const tags = await db.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ tags });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
