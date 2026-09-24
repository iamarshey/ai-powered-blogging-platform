import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { runResearchAssistantWorkflow } from '@/lib/ai/workflows/research-assistant';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'AUTHOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Author privileges required' }, { status: 403 });
    }

    const { topic } = await req.json();
    if (!topic) return NextResponse.json({ error: 'Topic is required' }, { status: 400 });

    const report = await runResearchAssistantWorkflow(topic);
    return NextResponse.json({ report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
