export async function generateEmbedding(text: string): Promise<number[]> {
  const cleanText = text.replace(/\n/g, ' ').trim();
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey !== '') {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: cleanText.slice(0, 8000),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data[0]?.embedding || generateMockEmbedding(cleanText);
      }
    } catch (error) {
      console.warn('[Embedding Warning] OpenAI API request failed, using deterministic embedding vector fallback.');
    }
  }

  return generateMockEmbedding(cleanText);
}

export function generateMockEmbedding(text: string): number[] {
  const dim = 1536;
  const vector: number[] = new Array(dim);

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  let norm = 0;
  for (let i = 0; i < dim; i++) {
    const val = Math.sin(hash * (i + 1)) * 10000;
    const frac = val - Math.floor(val);
    const score = (frac - 0.5) * 2;
    vector[i] = score;
    norm += score * score;
  }

  const mag = Math.sqrt(norm) || 1;
  return vector.map((v) => v / mag);
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}
