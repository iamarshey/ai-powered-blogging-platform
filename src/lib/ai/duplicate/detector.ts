import { searchPostEmbeddings } from '../vector';

export interface DuplicateCheckResult {
  hasPotentialDuplicate: boolean;
  maxSimilarity: number;
  matches: { title: string; slug: string; similarity: number }[];
}

export async function detectDuplicateContent(
  title: string,
  content: string
): Promise<DuplicateCheckResult> {
  const queryText = `${title}\n${content.slice(0, 1000)}`;
  const searchResults = await searchPostEmbeddings(queryText, 4, 0.4);

  const matches = searchResults.map((res) => ({
    title: res.metadata?.title || 'Existing Article',
    slug: res.metadata?.slug || '',
    similarity: parseFloat((res.similarity * 100).toFixed(1)),
  }));

  const maxSim = matches.length > 0 ? matches[0].similarity : 0;
  const hasPotentialDuplicate = maxSim >= 75.0;

  return {
    hasPotentialDuplicate,
    maxSimilarity: maxSim,
    matches,
  };
}
