// Environment configuration
export const config = {
  // LLM Provider
  llmProvider: (process.env.LLM_PROVIDER || "openai") as "openai" | "anthropic",
  
  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  openaiEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  
  // Anthropic
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  anthropicModel: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
  
  // Document
  documentPath: process.env.DOCUMENT_PATH || "./data/source.docx",
  
  // Dev mode
  devMode: process.env.DEV_MODE === "true",
  
  // Retrieval settings
  defaultTopK: 5,
  maxTopK: 10,
  
  // Chunking settings
  targetChunkTokens: 750,
  minChunkTokens: 600,
  maxChunkTokens: 900,
  chunkOverlapTokens: 100,
  
  // Embedding dimensions
  embeddingDimensions: 1536,
} as const;

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (config.llmProvider === "openai" && !config.openaiApiKey) {
    errors.push("OPENAI_API_KEY is required when using OpenAI provider");
  }
  
  if (config.llmProvider === "anthropic" && !config.anthropicApiKey) {
    errors.push("ANTHROPIC_API_KEY is required when using Anthropic provider");
  }
  
  // Always need OpenAI for embeddings (for now)
  if (!config.openaiApiKey) {
    errors.push("OPENAI_API_KEY is required for embeddings");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

