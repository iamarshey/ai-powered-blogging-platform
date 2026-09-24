import { HybridSearchResult } from '../retrieval/hybrid';

export function rerankHybridResults(
  query: string,
  results: HybridSearchResult[],
  limit: number = 10
): HybridSearchResult[] {
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 2);

  const reranked = results.map((item) => {
    let finalScore = item.combinedScore;

    if (item.keywordRank !== undefined && item.vectorRank !== undefined) {
      finalScore += 0.25;
    }

    const titleLower = item.title.toLowerCase();
    let titleMatchCount = 0;
    queryWords.forEach((word) => {
      if (titleLower.includes(word)) titleMatchCount++;
    });

    if (titleMatchCount > 0) {
      finalScore += (titleMatchCount / queryWords.length) * 0.2;
    }

    return {
      ...item,
      combinedScore: parseFloat(finalScore.toFixed(4)),
    };
  });

  return reranked
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, limit);
}
