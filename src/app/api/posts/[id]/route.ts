import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const post = await db.post.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        author: { select: { id: true, profile: true } },
        comments: {
          include: {
            author: { select: { profile: { select: { name: true, username: true, avatar: true } } } },
            likes: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { likes: true, bookmarks: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment View Count
    await db.post.update({
      where: { id: post.id },
      data: { viewsCount: { increment: 1 } },
    });

    return NextResponse.json({ post });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const post = await db.post.findUnique({ where: { id: params.id } });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    if (post.authorId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, subtitle, content, excerpt, categoryId, status, coverImage } = await req.json();

    const postStatus = status || post.status;
    const publishedAt = postStatus === 'PUBLISHED' && !post.publishedAt ? new Date() : post.publishedAt;

    const updated = await db.post.update({
      where: { id: params.id },
      data: {
        title: title || post.title,
        subtitle: subtitle !== undefined ? subtitle : post.subtitle,
        content: content || post.content,
        excerpt: excerpt || post.excerpt,
        coverImage: coverImage !== undefined ? coverImage : post.coverImage,
        status: postStatus,
        publishedAt,
        categoryId: categoryId !== undefined ? categoryId : post.categoryId,
      },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const post = await db.post.findUnique({ where: { id: params.id } });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    if (post.authorId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.post.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
