import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const postId = params.id;
    const existing = await db.postLike.findUnique({
      where: { postId_userId: { postId, userId: user.userId } },
    });

    if (existing) {
      await db.postLike.delete({
        where: { postId_userId: { postId, userId: user.userId } },
      });
      return NextResponse.json({ liked: false });
    } else {
      await db.postLike.create({
        data: { postId, userId: user.userId },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
