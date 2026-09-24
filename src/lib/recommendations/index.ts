import db from '../db';
import { executeHybridSearch } from '../ai/retrieval/hybrid';

export interface RecommendedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string | null;
  category?: string;
  authorName: string;
  matchReason: string;
}

export async function getPersonalizedRecommendations(
  userId?: string,
  limit: number = 6
): Promise<RecommendedPost[]> {
  if (!userId) {
    // Fallback for unauthenticated readers: popular published posts
    const posts = await db.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewsCount: 'desc' },
      take: limit,
      include: {
        category: true,
        author: { select: { profile: { select: { name: true } } } },
      },
    });

    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || p.content.slice(0, 160) + '...',
      coverImage: p.coverImage,
      category: p.category?.name,
      authorName: p.author.profile?.name || 'Author',
      matchReason: 'Popular Trending Post',
    }));
  }

  // 1. Fetch User Reading History & Bookmarks
  const history = await db.readingHistory.findMany({
    where: { userId },
    orderBy: { readAt: 'desc' },
    take: 5,
    include: { post: { select: { title: true, categoryId: true } } },
  });

  const categoriesRead = history.map((h) => h.post.categoryId).filter(Boolean) as string[];

  // 2. Query posts matching read categories or similar content
  const recommended = await db.post.findMany({
    where: {
      status: 'PUBLISHED',
      categoryId: categoriesRead.length > 0 ? { in: categoriesRead } : undefined,
    },
    take: limit,
    include: {
      category: true,
      author: { select: { profile: { select: { name: true } } } },
    },
  });

  return recommended.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt || p.content.slice(0, 160) + '...',
    coverImage: p.coverImage,
    category: p.category?.name,
    authorName: p.author.profile?.name || 'Author',
    matchReason: 'Based on your reading history & category interests',
  }));
}
