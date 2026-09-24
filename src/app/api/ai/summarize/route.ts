import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateTextCompletion } from '@/lib/ai/providers';
import { getOrSetCache } from '@/lib/ai/caching/cache';

export async function POST(req: Request) {
  try {
    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

    const cacheKey = `summary:${postId}`;
    const result = await getOrSetCache(
      cacheKey,
      async () => {
        const post = await db.post.findUnique({
          where: { id: postId },
          select: { title: true, content: true },
        });

        if (!post) throw new Error('Post not found');

        const prompt = `Provide a structured summary of article "${post.title}". Include:
1. TL;DR (1 sentence)
2. 3 Key Bullet Takeaways
3. Main Concepts Covered

CONTENT:
${post.content.slice(0, 3000)}`;

        const completion = await generateTextCompletion(prompt, { action: 'GENERATE_SUMMARY' });
        return { summary: completion.text, provider: completion.provider };
      },
      3600 // 1 hour cache TTL
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
