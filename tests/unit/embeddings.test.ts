import { describe, it, expect } from 'vitest';
import { generateMockEmbedding, cosineSimilarity } from '@/lib/ai/embeddings';

describe('Embeddings & Vector Similarity Engine', () => {
  it('should generate a 1536-dimensional normalized vector', () => {
    const vec = generateMockEmbedding('Test content for pgvector embedding');
    expect(vec.length).toBe(1536);

    let norm = 0;
    for (const val of vec) {
      norm += val * val;
    }
    expect(Math.sqrt(norm)).toBeCloseTo(1.0, 4);
  });

  it('should return identical similarity 1.0 for identical vectors', () => {
    const vecA = generateMockEmbedding('Artificial Intelligence');
    const similarity = cosineSimilarity(vecA, vecA);
    expect(similarity).toBeCloseTo(1.0, 4);
  });
});
