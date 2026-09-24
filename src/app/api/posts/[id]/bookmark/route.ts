import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const postId = params.id;
    const existing = await db.bookmark.findUnique({
      where: { postId_userId: { postId, userId: user.userId } },
    });

    if (existing) {
      await db.bookmark.delete({
        where: { postId_userId: { postId, userId: user.userId } },
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      await db.bookmark.create({
        data: { postId, userId: user.userId },
      });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
