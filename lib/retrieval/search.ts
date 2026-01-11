import { embedText, cosineSimilarity } from "./embeddings";
import { getAllChunksWithEmbeddings, getChunksByIds } from "@/lib/db/static-store";
import { config } from "@/lib/config";

export interface SearchResult {
  id: string;
  heading: string;
  content: string;
  score: number;
  sourcePath: string;
  offsetStart: number;
  offsetEnd: number;
}

/**
 * Search for relevant chunks using cosine similarity
 */
export async function searchChunks(
  query: string,
  topK: number = config.defaultTopK
): Promise<SearchResult[]> {
  // Get all chunks with embeddings first to check if document is ingested
  const chunks = getAllChunksWithEmbeddings();

  if (chunks.length === 0) {
    throw new Error(
      "No document data found. The document needs to be ingested first. " +
      "Please contact your administrator or run 'npm run ingest' locally."
    );
  }

  // Get query embedding
  const queryEmbedding = await embedText(query);

  // Calculate similarity scores
  const scored = chunks.map((chunk) => ({
    id: chunk.id,
    heading: chunk.heading,
    content: chunk.content,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Get top K results
  const topResults = scored.slice(0, Math.min(topK, config.maxTopK));

  // Fetch full chunk data for top results
  const fullChunks = getChunksByIds(topResults.map((r) => r.id));
  const chunkMap = new Map(fullChunks.map((c) => [c.id, c]));

  // Build final results
  const results: SearchResult[] = topResults.map((result) => {
    const chunk = chunkMap.get(result.id);
    return {
      id: result.id,
      heading: result.heading,
      content: result.content,
      score: result.score,
      sourcePath: chunk?.source_path || "",
      offsetStart: chunk?.offset_start || 0,
      offsetEnd: chunk?.offset_end || 0,
    };
  });

  return results;
}

/**
 * Search with minimum score threshold
 */
export async function searchChunksWithThreshold(
  query: string,
  topK: number = config.defaultTopK,
  minScore: number = 0.3
): Promise<SearchResult[]> {
  const results = await searchChunks(query, topK * 2); // Fetch more initially
  return results.filter((r) => r.score >= minScore).slice(0, topK);
}
