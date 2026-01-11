import { searchChunks, type SearchResult } from "@/lib/retrieval/search";
import { enhanceResults } from "@/lib/retrieval/rerank";
import { buildPrompt, buildNotFoundPrompt } from "./prompts";
import { generate, createStreamResponse } from "./providers";
import { config } from "@/lib/config";

export interface Citation {
  id: string;
  number: number;
  heading: string;
  excerpt: string;
  score: number;
  sourcePath: string;
  offsetStart: number;
  offsetEnd: number;
}

export interface AskResult {
  answer: string;
  citations: Citation[];
  retrieved: SearchResult[];
}

/**
 * Create an excerpt from content (first ~150 chars)
 */
function createExcerpt(content: string, maxLength: number = 150): string {
  if (content.length <= maxLength) {
    return content;
  }
  
  // Try to break at a word boundary
  const truncated = content.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + "...";
  }
  
  return truncated + "...";
}

/**
 * Convert search results to citations
 */
function resultsToCitations(results: SearchResult[]): Citation[] {
  return results.map((result, index) => ({
    id: result.id,
    number: index + 1,
    heading: result.heading,
    excerpt: createExcerpt(result.content),
    score: result.score,
    sourcePath: result.sourcePath,
    offsetStart: result.offsetStart,
    offsetEnd: result.offsetEnd,
  }));
}

/**
 * Ask a question and get a grounded answer with citations
 */
export async function ask(
  question: string,
  options: {
    topK?: number;
    strict?: boolean;
    patientResponse?: boolean;
  } = {}
): Promise<AskResult> {
  const { topK = config.defaultTopK, strict = true, patientResponse = false } = options;

  // Step 1: Search for relevant chunks
  const searchResults = await searchChunks(question, topK * 2);
  
  // Step 2: Rerank results
  const rerankedResults = enhanceResults(searchResults, question);
  const topResults = rerankedResults.slice(0, topK);

  // Step 3: Check if we have relevant results (score threshold)
  const hasRelevantResults = topResults.some((r) => r.score > 0.35);

  // Step 4: Build prompt (with patient response mode if enabled)
  const prompt = hasRelevantResults
    ? buildPrompt(question, topResults, strict, patientResponse)
    : buildNotFoundPrompt(question, topResults, patientResponse);

  // Step 5: Generate answer
  const answer = await generate({
    system: prompt.system,
    user: prompt.user,
  });

  // Step 6: Build citations
  const citations = resultsToCitations(topResults);

  return {
    answer,
    citations,
    retrieved: topResults,
  };
}

/**
 * Ask a question with streaming response
 */
export function askStream(
  question: string,
  options: {
    topK?: number;
    strict?: boolean;
    patientResponse?: boolean;
  } = {}
): {
  stream: () => Promise<{ readable: ReadableStream; citations: Citation[]; retrieved: SearchResult[] }>;
} {
  const { topK = config.defaultTopK, strict = true, patientResponse = false } = options;

  return {
    stream: async () => {
      // Step 1: Search for relevant chunks
      const searchResults = await searchChunks(question, topK * 2);
      
      // Step 2: Rerank results
      const rerankedResults = enhanceResults(searchResults, question);
      const topResults = rerankedResults.slice(0, topK);

      // Step 3: Check if we have relevant results
      const hasRelevantResults = topResults.some((r) => r.score > 0.35);

      // Step 4: Build prompt (with patient response mode if enabled)
      const prompt = hasRelevantResults
        ? buildPrompt(question, topResults, strict, patientResponse)
        : buildNotFoundPrompt(question, topResults, patientResponse);

      // Step 5: Create stream
      const readable = createStreamResponse({
        system: prompt.system,
        user: prompt.user,
      });

      // Step 6: Build citations
      const citations = resultsToCitations(topResults);

      return {
        readable,
        citations,
        retrieved: topResults,
      };
    },
  };
}

