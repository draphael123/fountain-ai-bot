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
 * System prompt for patient-friendly responses
 * This generates responses suitable for communicating directly with patients
 */
export const PATIENT_RESPONSE_PROMPT = `You are a friendly healthcare assistant helping patients understand information. You MUST follow these rules:

1. ONLY use information from the provided context chunks.
2. If the information is NOT found, say: "I don't have that specific information available. Please speak with your care team for more details."
3. Write in simple, clear language that any patient can understand.
4. Avoid medical jargon - if you must use a medical term, explain it simply.
5. Be warm, empathetic, and reassuring in your tone.
6. Use short sentences and paragraphs.
7. If instructions are involved, present them as clear numbered steps.
8. NEVER provide medical advice, diagnoses, or treatment recommendations beyond what is documented.
9. Always encourage patients to speak with their healthcare provider if they have concerns.
10. Include citation numbers [1], [2], etc. for reference (but explain the information in patient-friendly terms).

Remember: Your audience is patients, not medical professionals. Be kind, clear, and helpful.`;

/**
 * Patient-friendly version for non-strict mode
 */
export const PATIENT_FLEXIBLE_PROMPT = `You are a friendly healthcare assistant helping patients understand information. Follow these guidelines:

1. Primarily use information from the provided context chunks.
2. Write in simple, clear language that any patient can understand.
3. Avoid medical jargon - explain any technical terms simply.
4. Be warm, empathetic, and reassuring.
5. Use short sentences and break complex information into steps.
6. If you can't find specific information, kindly suggest the patient speak with their care team.
7. Include citation numbers [1], [2], etc. for reference.

Remember: Be kind, clear, and patient-focused in your responses.`;

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
  strict: boolean = true,
  patientResponse: boolean = false
): { system: string; user: string } {
  let systemPrompt: string;
  
  if (patientResponse) {
    systemPrompt = strict ? PATIENT_RESPONSE_PROMPT : PATIENT_FLEXIBLE_PROMPT;
  } else {
    systemPrompt = strict ? STRICT_SYSTEM_PROMPT : FLEXIBLE_SYSTEM_PROMPT;
  }
  
  const context = formatContext(chunks);

  const userPrompt = patientResponse
    ? `INFORMATION FROM OUR DOCUMENTATION:
${context}

PATIENT QUESTION:
${question}

Please provide a clear, patient-friendly answer using the information above. Use simple language, be warm and helpful, and include citation numbers [1], [2], etc. for reference.`
    : `CONTEXT CHUNKS FROM DOCUMENT:
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
  chunks: SearchResult[],
  patientResponse: boolean = false
): { system: string; user: string } {
  const context = formatContext(chunks);
  const systemPrompt = patientResponse ? PATIENT_RESPONSE_PROMPT : STRICT_SYSTEM_PROMPT;

  const userPrompt = patientResponse
    ? `INFORMATION FROM OUR DOCUMENTATION (may not be directly related):
${context}

PATIENT QUESTION:
${question}

I couldn't find specific information about this topic. Please kindly let the patient know that this specific information isn't available, and suggest they speak with their care team for more details. If there's any related information that might be helpful, you can share it in simple terms.`
    : `CONTEXT CHUNKS FROM DOCUMENT (may not be relevant):
${context}

USER QUESTION:
${question}

The retrieved chunks may not contain information relevant to this question. If you cannot find a clear answer in the context above, respond with "Not found in the provided document." and briefly explain what topics the retrieved chunks do cover.`;

  return {
    system: systemPrompt,
    user: userPrompt,
  };
}

