import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { moderateContent } from '@/lib/ai/moderation/guardrails';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Authentication required to comment' }, { status: 401 });

    const { postId, content, parentId } = await req.json();
    if (!postId || !content) {
      return NextResponse.json({ error: 'postId and content are required' }, { status: 400 });
    }

    const comment = await db.comment.create({
      data: {
        postId,
        authorId: user.userId,
        content,
        parentId: parentId || null,
      },
      include: {
        author: { select: { profile: { select: { name: true, username: true, avatar: true } } } },
      },
    });

    // Moderate comment asynchronously
    setTimeout(async () => {
      await moderateContent(content, 'COMMENT', comment.id);
    }, 0);

    return NextResponse.json({ success: true, comment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
