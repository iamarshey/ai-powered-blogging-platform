import db from '../../db';
import { generateEmbedding, cosineSimilarity } from '../embeddings';

export interface VectorSearchResult {
  id: string;
  postId?: string;
  documentId?: string;
  content: string;
  similarity: number;
  metadata?: any;
}

export async function indexPostEmbedding(postId: string, content: string, chunkIndex: number = 0) {
  const vector = await generateEmbedding(content);
  const vectorJson = JSON.stringify(vector);

  await db.postEmbedding.create({
    data: {
      postId,
      chunkIndex,
      content,
      vectorJson,
    },
  });
}

export async function searchPostEmbeddings(
  query: string,
  limit: number = 5,
  minSimilarity: number = 0.2
): Promise<VectorSearchResult[]> {
  const queryVec = await generateEmbedding(query);

  const records = await db.postEmbedding.findMany({
    where: {
      post: {
        status: 'PUBLISHED',
      },
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
          author: { select: { profile: { select: { username: true, name: true } } } },
        },
      },
    },
  });

  const scoredResults = records.map((record) => {
    const vector: number[] = JSON.parse(record.vectorJson);
    const similarity = cosineSimilarity(queryVec, vector);
    return {
      id: record.id,
      postId: record.postId,
      content: record.content,
      similarity,
      metadata: {
        title: record.post.title,
        slug: record.post.slug,
        author: record.post.author.profile?.name || 'Author',
      },
    };
  });

  return scoredResults
    .filter((r) => r.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

export async function searchDocumentEmbeddings(
  query: string,
  documentId?: string,
  limit: number = 5
): Promise<VectorSearchResult[]> {
  const queryVec = await generateEmbedding(query);

  const whereClause: any = { vectorJson: { not: null } };
  if (documentId) {
    whereClause.documentId = documentId;
  }

  const chunks = await db.documentChunk.findMany({
    where: whereClause,
    include: { document: { select: { id: true, title: true } } },
  });

  const scoredResults = chunks.map((chunk) => {
    const vector: number[] = JSON.parse(chunk.vectorJson || '[]');
    const similarity = cosineSimilarity(queryVec, vector);
    return {
      id: chunk.id,
      documentId: chunk.documentId,
      content: chunk.content,
      similarity,
      metadata: {
        title: chunk.document.title,
        chunkIndex: chunk.chunkIndex,
      },
    };
  });

  return scoredResults.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
}
