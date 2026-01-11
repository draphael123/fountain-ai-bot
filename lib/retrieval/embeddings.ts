import OpenAI from "openai";
import { config } from "@/lib/config";

// OpenAI client singleton
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    if (!config.openaiApiKey) {
      throw new Error("OPENAI_API_KEY is required for embeddings");
    }
    openaiClient = new OpenAI({ apiKey: config.openaiApiKey });
  }
  return openaiClient;
}

/**
 * Generate embedding for a single text
 */
export async function embedText(text: string): Promise<number[]> {
  const openai = getOpenAI();
  
  const response = await openai.embeddings.create({
    model: config.openaiEmbeddingModel,
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts (batched)
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  
  const openai = getOpenAI();
  const batchSize = 100; // OpenAI limit
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    const response = await openai.embeddings.create({
      model: config.openaiEmbeddingModel,
      input: batch,
    });

    // Sort by index to maintain order
    const sorted = response.data.sort((a, b) => a.index - b.index);
    allEmbeddings.push(...sorted.map((d) => d.embedding));
  }

  return allEmbeddings;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

