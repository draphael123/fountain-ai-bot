import type { SearchResult } from "@/lib/retrieval/search";

/**
 * System prompt for strict document-grounded Q&A
 */
export const STRICT_SYSTEM_PROMPT = `You are a document Q&A assistant for internal operations workflows. You MUST follow these rules strictly:

1. ONLY use information from the provided context chunks to answer questions.
2. If the information is NOT found in the context, respond with: "Not found in the provided document."
3. NEVER use external knowledge, personal opinions, or "best practices" that are not explicitly stated in the document.
4. Include citation numbers [1], [2], etc. for each claim you make, referencing the relevant context chunk.
5. NEVER provide legal, medical, or compliance advice beyond what is explicitly documented.
6. Be concise but thorough - include all relevant information from the document.
7. If a question is ambiguous, state what assumptions you're making based on the document.
8. Format your response clearly with proper paragraphs and structure.

Remember: You can ONLY use information from the context provided. If you're unsure, say so.`;

/**
 * System prompt for non-strict mode (allows more flexibility)
 */
export const FLEXIBLE_SYSTEM_PROMPT = `You are a helpful document Q&A assistant for internal operations workflows. Follow these guidelines:

1. Primarily use information from the provided context chunks to answer questions.
2. Include citation numbers [1], [2], etc. for information from the document.
3. If information is not found in the document, you may note that while still being helpful.
4. Be concise but thorough.
5. Format your response clearly.

Note: Prioritize document content but you may provide helpful context when appropriate.`;

/**
 * Format context chunks for the LLM
 */
export function formatContext(chunks: SearchResult[]): string {
  if (chunks.length === 0) {
    return "No relevant context found in the document.";
  }

  return chunks
    .map((chunk, index) => {
      const citation = `[${index + 1}]`;
      return `${citation} Section: ${chunk.heading}
---
${chunk.content}
---`;
    })
    .join("\n\n");
}

/**
 * Build the complete prompt for the LLM
 */
export function buildPrompt(
  question: string,
  chunks: SearchResult[],
  strict: boolean = true
): { system: string; user: string } {
  const systemPrompt = strict ? STRICT_SYSTEM_PROMPT : FLEXIBLE_SYSTEM_PROMPT;
  const context = formatContext(chunks);

  const userPrompt = `CONTEXT CHUNKS FROM DOCUMENT:
${context}

USER QUESTION:
${question}

Please answer the question using ONLY the information provided in the context chunks above. Include citation numbers [1], [2], etc. for each claim.`;

  return {
    system: systemPrompt,
    user: userPrompt,
  };
}

/**
 * Build prompt for when no relevant chunks are found
 */
export function buildNotFoundPrompt(
  question: string,
  chunks: SearchResult[]
): { system: string; user: string } {
  const context = formatContext(chunks);

  return {
    system: STRICT_SYSTEM_PROMPT,
    user: `CONTEXT CHUNKS FROM DOCUMENT (may not be relevant):
${context}

USER QUESTION:
${question}

The retrieved chunks may not contain information relevant to this question. If you cannot find a clear answer in the context above, respond with "Not found in the provided document." and briefly explain what topics the retrieved chunks do cover.`,
  };
}

