import { NextResponse } from 'next/server';
import { generateTextCompletion } from '@/lib/ai/providers';
import { getCurrentUser } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'AUTHOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Author privileges required' }, { status: 403 });
    }

    const { action, prompt, textSelection, contextContent } = await req.json();

    let systemPrompt = 'You are a professional AI Writing Assistant embedded inside a blog CMS.';
    let finalPrompt = '';

    switch (action) {
      case 'GENERATE_TITLE':
        finalPrompt = `Generate 5 catchy, high-converting article titles for topic: "${prompt || contextContent?.slice(0, 300)}"`;
        break;
      case 'GENERATE_OUTLINE':
        finalPrompt = `Create a detailed Markdown outline for an article titled "${prompt}"`;
        break;
      case 'CONTINUE_WRITING':
        finalPrompt = `Continue writing seamlessly from where this text left off:\n\n${contextContent?.slice(-1000)}`;
        break;
      case 'EXPAND_TEXT':
        finalPrompt = `Expand this paragraph with more technical detail, practical code examples, and clarity:\n\n${textSelection}`;
        break;
      case 'SHORTEN_TEXT':
        finalPrompt = `Summarize and shorten this text while retaining core key takeaways:\n\n${textSelection}`;
        break;
      case 'REWRITE_TONE':
        finalPrompt = `Rewrite this passage into an engaging, authoritative, modern engineering tone:\n\n${textSelection}`;
        break;
      case 'IMPROVE_GRAMMAR':
        finalPrompt = `Fix all grammar, punctuation, and structural flow issues in this text without changing core meaning:\n\n${textSelection}`;
        break;
      default:
        finalPrompt = prompt || textSelection || 'Assist in writing this article section.';
    }

    const completion = await generateTextCompletion(finalPrompt, {
      action: action || 'AI_WRITE',
      systemPrompt,
      userId: user.userId,
    });

    return NextResponse.json({
      result: completion.text,
      provider: completion.provider,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
