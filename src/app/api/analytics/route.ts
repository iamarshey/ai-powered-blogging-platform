import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const totalPosts = await db.post.count({
      where: user.role === 'ADMIN' ? undefined : { authorId: user.userId },
    });

    const publishedPosts = await db.post.count({
      where: {
        status: 'PUBLISHED',
        ...(user.role === 'ADMIN' ? {} : { authorId: user.userId }),
      },
    });

    const draftPosts = await db.post.count({
      where: {
        status: 'DRAFT',
        ...(user.role === 'ADMIN' ? {} : { authorId: user.userId }),
      },
    });

    const viewsAggregate = await db.post.aggregate({
      _sum: { viewsCount: true },
      where: user.role === 'ADMIN' ? undefined : { authorId: user.userId },
    });

    const totalViews = viewsAggregate._sum.viewsCount || 0;

    const totalLikes = await db.postLike.count({
      where: user.role === 'ADMIN' ? undefined : { post: { authorId: user.userId } },
    });

    const totalComments = await db.comment.count({
      where: user.role === 'ADMIN' ? undefined : { post: { authorId: user.userId } },
    });

    return NextResponse.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalLikes,
      totalComments,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
