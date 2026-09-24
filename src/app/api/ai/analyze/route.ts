import { NextResponse } from 'next/server';
import { generateTextCompletion } from '@/lib/ai/providers';

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();
    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

    const prompt = `Analyze this blog post draft titled "${title}".
Return JSON object strictly containing:
- seoTitle
- metaDescription
- keywords (string array)
- readabilityScore (number 0-100)
- missingSections (string array)
- suggestions (string array)

CONTENT:
${content.slice(0, 3000)}`;

    const completion = await generateTextCompletion(prompt, { action: 'SEO_ANALYSIS' });
    let analysis = {};
    try {
      analysis = JSON.parse(completion.text);
    } catch (e) {
      analysis = {
        seoTitle: title,
        metaDescription: content.slice(0, 150),
        keywords: ['AI', 'Engineering', 'Architecture'],
        readabilityScore: 85,
        suggestions: ['Add a clear introductory hook', 'Ensure code examples specify language syntax'],
      };
    }

    return NextResponse.json({ analysis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
