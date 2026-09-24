import db from '../../db';
import { searchPostEmbeddings, VectorSearchResult } from '../vector';
import { rerankHybridResults } from '../reranking';

export interface HybridSearchResult {
  id: string;
  postId: string;
  title: string;
  slug: string;
  excerpt: string;
  category?: string;
  combinedScore: number;
  keywordRank?: number;
  vectorRank?: number;
  authorName: string;
}

export async function executeHybridSearch(
  query: string,
  limit: number = 10
): Promise<HybridSearchResult[]> {
  if (!query || query.trim() === '') return [];

  const keywordPosts = await db.post.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 20,
    select: {
      id: true,
      status: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      category: { select: { name: true } },
      author: { select: { profile: { select: { name: true } } } },
    },
  });

  const vectorResults: VectorSearchResult[] = await searchPostEmbeddings(query, 20);

  const k = 60;
  const scoreMap = new Map<string, { post: any; keywordRank?: number; vectorRank?: number; rrfScore: number }>();

  keywordPosts.forEach((post, index) => {
    const rank = index + 1;
    scoreMap.set(post.id, {
      post,
      keywordRank: rank,
      rrfScore: 1 / (k + rank),
    });
  });

  for (let i = 0; i < vectorResults.length; i++) {
    const vRes = vectorResults[i];
    if (!vRes.postId) continue;

    const rank = i + 1;
    const existing = scoreMap.get(vRes.postId);

    if (existing) {
      existing.vectorRank = rank;
      existing.rrfScore += 1 / (k + rank);
    } else {
      const post = await db.post.findUnique({
        where: { id: vRes.postId },
        select: {
          id: true,
          status: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          category: { select: { name: true } },
          author: { select: { profile: { select: { name: true } } } },
        },
      });

      if (post && post.status === 'PUBLISHED') {
        scoreMap.set(post.id, {
          post,
          vectorRank: rank,
          rrfScore: 1 / (k + rank),
        });
      }
    }
  }

  const combinedList = Array.from(scoreMap.values()).map((entry) => ({
    id: entry.post.id,
    postId: entry.post.id,
    title: entry.post.title,
    slug: entry.post.slug,
    excerpt: entry.post.excerpt || entry.post.content.slice(0, 160) + '...',
    category: entry.post.category?.name,
    combinedScore: entry.rrfScore,
    keywordRank: entry.keywordRank,
    vectorRank: entry.vectorRank,
    authorName: entry.post.author?.profile?.name || 'Author',
  }));

  return rerankHybridResults(query, combinedList, limit);
}
