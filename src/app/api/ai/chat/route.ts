import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { runBlogAiAgent } from '@/lib/ai/agents/blog-agent';
import { globalBlogChatbotRAG } from '@/lib/ai/rag/qa';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { prompt, mode } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (mode === 'AGENT') {
      const agentRes = await runBlogAiAgent(prompt, user?.userId);
      return NextResponse.json({
        response: agentRes.response,
        toolCalls: agentRes.toolCallsMade,
      });
    }

    // Default RAG Chatbot mode
    const ragRes = await globalBlogChatbotRAG(prompt);
    return NextResponse.json({
      response: ragRes.answer,
      sources: ragRes.sources,
      provider: ragRes.provider,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
