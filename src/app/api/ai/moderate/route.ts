import { NextResponse } from 'next/server';
import { moderateContent } from '@/lib/ai/moderation/guardrails';

export async function POST(req: Request) {
  try {
    const { text, targetType, targetId } = await req.json();
    if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });

    const result = await moderateContent(text, targetType || 'POST', targetId || 'temp');
    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
