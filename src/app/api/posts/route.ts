import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { indexPostEmbedding } from '@/lib/ai/vector';
import { generateTextCompletion } from '@/lib/ai/providers';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const author = searchParams.get('author');
    const status = searchParams.get('status') || 'PUBLISHED';
    const sort = searchParams.get('sort') || 'newest';

    const where: any = {};
    if (status !== 'ALL') {
      where.status = status as any;
    }

    if (category) {
      where.category = { slug: category };
    }
    if (tag) {
      where.tags = { some: { tag: { slug: tag } } };
    }
    if (author) {
      where.author = { profile: { username: author } };
    }

    const orderBy = sort === 'popular' ? { viewsCount: 'desc' } : { createdAt: 'desc' };

    const posts = await db.post.findMany({
      where,
      orderBy: orderBy as any,
      include: {
        category: true,
        tags: { include: { tag: true } },
        author: { select: { profile: { select: { name: true, username: true, avatar: true } } } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'AUTHOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Author role required' }, { status: 403 });
    }

    const { title, subtitle, content, excerpt, categoryId, tags, status, coverImage } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const postStatus = status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
    const publishedAt = postStatus === 'PUBLISHED' ? new Date() : null;
    const readingTimeMin = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

    const post = await db.post.create({
      data: {
        title,
        subtitle,
        slug,
        content,
        excerpt: excerpt || content.slice(0, 160) + '...',
        coverImage,
        status: postStatus,
        publishedAt,
        readingTimeMin,
        authorId: user.userId,
        categoryId: categoryId || null,
      },
    });

    // Handle Tags association
    if (Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        const tagSlug = tagName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        let tagRecord = await db.tag.findUnique({ where: { slug: tagSlug } });
        if (!tagRecord) {
          tagRecord = await db.tag.create({ data: { name: tagName, slug: tagSlug } });
        }
        await db.postTag.create({ data: { postId: post.id, tagId: tagRecord.id } });
      }
    }

    // AI Workflow Automation on Publish (Asynchronous vector indexing)
    if (postStatus === 'PUBLISHED') {
      setTimeout(async () => {
        try {
          await indexPostEmbedding(post.id, `${post.title}\n${post.content}`);
        } catch (e) {
          console.warn('[AI Workflow Automation Warning] Indexing failed:', e);
        }
      }, 0);
    }

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
