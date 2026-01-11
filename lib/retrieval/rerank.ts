import type { SearchResult } from "./search";

/**
 * Simple keyword-based reranking
 * Boosts results that have high keyword overlap with the query
 */
export function rerankByKeywords(
  results: SearchResult[],
  query: string,
  boostFactor: number = 0.1
): SearchResult[] {
  // Extract keywords from query (simple approach)
  const queryKeywords = extractKeywords(query);
  
  if (queryKeywords.length === 0) {
    return results;
  }

  // Calculate keyword overlap scores
  const reranked = results.map((result) => {
    const contentKeywords = extractKeywords(result.content);
    const headingKeywords = extractKeywords(result.heading);
    const allResultKeywords = new Set([...contentKeywords, ...headingKeywords]);

    // Count matching keywords
    let matches = 0;
    for (const keyword of queryKeywords) {
      if (allResultKeywords.has(keyword)) {
        matches++;
      }
    }

    // Calculate boost (0 to boostFactor based on keyword overlap)
    const overlapRatio = matches / queryKeywords.length;
    const boost = overlapRatio * boostFactor;

    return {
      ...result,
      score: result.score + boost,
    };
  });

  // Re-sort by adjusted score
  reranked.sort((a, b) => b.score - a.score);

  return reranked;
}

/**
 * Extract keywords from text
 * Removes common stop words and returns lowercase unique words
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
    "has", "he", "in", "is", "it", "its", "of", "on", "or", "that",
    "the", "to", "was", "were", "will", "with", "this", "their", "they",
    "have", "been", "would", "could", "should", "what", "when", "where",
    "which", "who", "how", "can", "do", "does", "did", "you", "your",
    "we", "our", "i", "my", "me", "if", "then", "than", "but", "not",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  // Return unique keywords
  return [...new Set(words)];
}

/**
 * Combine semantic search results with keyword reranking
 */
export function enhanceResults(
  results: SearchResult[],
  query: string
): SearchResult[] {
  return rerankByKeywords(results, query);
}

