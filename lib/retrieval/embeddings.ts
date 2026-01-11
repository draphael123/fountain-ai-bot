import { config } from "@/lib/config";

/**
 * Parse OpenAI error response for user-friendly messages
 */
function parseOpenAIError(status: number, errorText: string): string {
  try {
    const parsed = JSON.parse(errorText);
    const errorMessage = parsed.error?.message || errorText;
    const errorCode = parsed.error?.code || "";
    
    if (status === 401 || errorCode === "invalid_api_key") {
      return "Invalid API key. Please check your OpenAI API key is correct and has not expired.";
    }
    if (status === 429) {
      if (errorMessage.includes("quota")) {
        return "OpenAI API quota exceeded. Please add credits to your OpenAI account at platform.openai.com/account/billing";
      }
      return "Too many requests. Please wait a moment and try again.";
    }
    if (status === 500 || status === 503) {
      return "OpenAI service is temporarily unavailable. Please try again in a few moments.";
    }
    if (status === 400) {
      return `Invalid request: ${errorMessage}`;
    }
    return `OpenAI error (${status}): ${errorMessage}`;
  } catch {
    return `OpenAI API error (${status}): ${errorText}`;
  }
}

/**
 * Generate embedding for a single text using direct fetch
 */
export async function embedText(text: string): Promise<number[]> {
  if (!config.openaiApiKey) {
    throw new Error(
      "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable."
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.openaiEmbeddingModel,
        input: text,
      }),
    });
  } catch (fetchError) {
    const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
    if (message.includes("fetch failed") || message.includes("ENOTFOUND") || message.includes("ECONNREFUSED")) {
      throw new Error(
        "Unable to connect to OpenAI. Please check your internet connection and try again."
      );
    }
    throw new Error(`Network error while connecting to OpenAI: ${message}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(parseOpenAIError(response.status, errorText));
  }

  const data = await response.json();
  
  if (!data.data?.[0]?.embedding) {
    throw new Error("Unexpected response from OpenAI: no embedding data returned");
  }
  
  return data.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts (batched) using direct fetch
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  
  if (!config.openaiApiKey) {
    throw new Error(
      "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable."
    );
  }

  const batchSize = 100; // OpenAI limit
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(texts.length / batchSize);
    
    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.openaiEmbeddingModel,
          input: batch,
        }),
      });
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
      throw new Error(
        `Network error while generating embeddings (batch ${batchNum}/${totalBatches}): ${message}`
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error generating embeddings (batch ${batchNum}/${totalBatches}): ${parseOpenAIError(response.status, errorText)}`
      );
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error(`Unexpected response from OpenAI (batch ${batchNum}/${totalBatches}): no data returned`);
    }
    
    // Sort by index to maintain order
    const sorted = data.data.sort((a: {index: number}, b: {index: number}) => a.index - b.index);
    allEmbeddings.push(...sorted.map((d: {embedding: number[]}) => d.embedding));
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
