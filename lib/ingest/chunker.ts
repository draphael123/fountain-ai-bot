import { get_encoding } from "tiktoken";
import { config } from "@/lib/config";
import type { ParsedSection } from "./docx-parser";

export interface Chunk {
  id: string;
  heading: string;
  content: string;
  sourcePath: string;
  offsetStart: number;
  offsetEnd: number;
  tokenCount: number;
}

// Initialize tiktoken encoder (cl100k_base is used by GPT-4)
let encoder: ReturnType<typeof get_encoding> | null = null;

function getEncoder() {
  if (!encoder) {
    encoder = get_encoding("cl100k_base");
  }
  return encoder;
}

/**
 * Count tokens in a string
 */
export function countTokens(text: string): number {
  const enc = getEncoder();
  return enc.encode(text).length;
}

/**
 * Generate a unique chunk ID
 */
function generateChunkId(heading: string, index: number): string {
  const sanitized = heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 30);
  return `${sanitized}-${index}-${Date.now().toString(36)}`;
}

/**
 * Split text into paragraphs
 */
function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Chunk a single section that might be too large
 */
function chunkLargeSection(
  section: ParsedSection,
  sourcePath: string,
  startIndex: number
): Chunk[] {
  const chunks: Chunk[] = [];
  const paragraphs = splitIntoParagraphs(section.content);
  
  let currentChunkContent: string[] = [];
  let currentTokenCount = 0;
  let chunkIndex = startIndex;
  let chunkStartOffset = section.startOffset;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    const paragraphTokens = countTokens(paragraph);

    // If adding this paragraph would exceed max tokens, save current chunk
    if (
      currentTokenCount + paragraphTokens > config.maxChunkTokens &&
      currentChunkContent.length > 0
    ) {
      const content = currentChunkContent.join("\n\n");
      chunks.push({
        id: generateChunkId(section.heading, chunkIndex),
        heading: section.heading,
        content,
        sourcePath,
        offsetStart: chunkStartOffset,
        offsetEnd: chunkStartOffset + content.length,
        tokenCount: currentTokenCount,
      });

      // Start new chunk with overlap
      const overlapParagraphs: string[] = [];
      let overlapTokens = 0;
      
      // Add paragraphs from the end until we hit overlap target
      for (let j = currentChunkContent.length - 1; j >= 0; j--) {
        const p = currentChunkContent[j];
        const pTokens = countTokens(p);
        if (overlapTokens + pTokens > config.chunkOverlapTokens) break;
        overlapParagraphs.unshift(p);
        overlapTokens += pTokens;
      }

      currentChunkContent = overlapParagraphs;
      currentTokenCount = overlapTokens;
      chunkIndex++;
      chunkStartOffset = section.startOffset + content.length - overlapParagraphs.join("\n\n").length;
    }

    // Handle single paragraphs that are too large (rare)
    if (paragraphTokens > config.maxChunkTokens) {
      // Save current chunk first if it has content
      if (currentChunkContent.length > 0) {
        const content = currentChunkContent.join("\n\n");
        chunks.push({
          id: generateChunkId(section.heading, chunkIndex),
          heading: section.heading,
          content,
          sourcePath,
          offsetStart: chunkStartOffset,
          offsetEnd: chunkStartOffset + content.length,
          tokenCount: currentTokenCount,
        });
        chunkIndex++;
        currentChunkContent = [];
        currentTokenCount = 0;
      }

      // Split the large paragraph by sentences
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      let sentenceChunk: string[] = [];
      let sentenceTokens = 0;

      for (const sentence of sentences) {
        const sTokens = countTokens(sentence);
        if (sentenceTokens + sTokens > config.maxChunkTokens && sentenceChunk.length > 0) {
          const content = sentenceChunk.join(" ");
          chunks.push({
            id: generateChunkId(section.heading, chunkIndex),
            heading: section.heading,
            content,
            sourcePath,
            offsetStart: chunkStartOffset,
            offsetEnd: chunkStartOffset + content.length,
            tokenCount: sentenceTokens,
          });
          chunkIndex++;
          chunkStartOffset += content.length;
          sentenceChunk = [];
          sentenceTokens = 0;
        }
        sentenceChunk.push(sentence);
        sentenceTokens += sTokens;
      }

      // Add remaining sentences
      if (sentenceChunk.length > 0) {
        currentChunkContent = sentenceChunk;
        currentTokenCount = sentenceTokens;
      }
    } else {
      currentChunkContent.push(paragraph);
      currentTokenCount += paragraphTokens;
    }
  }

  // Don't forget the last chunk
  if (currentChunkContent.length > 0) {
    const content = currentChunkContent.join("\n\n");
    chunks.push({
      id: generateChunkId(section.heading, chunkIndex),
      heading: section.heading,
      content,
      sourcePath,
      offsetStart: chunkStartOffset,
      offsetEnd: chunkStartOffset + content.length,
      tokenCount: currentTokenCount,
    });
  }

  return chunks;
}

/**
 * Convert parsed sections into chunks suitable for embedding
 */
export function chunkSections(
  sections: ParsedSection[],
  sourcePath: string
): Chunk[] {
  const chunks: Chunk[] = [];
  let globalIndex = 0;

  for (const section of sections) {
    const sectionTokens = countTokens(section.content);

    // If section fits within target size, keep it as one chunk
    if (sectionTokens <= config.maxChunkTokens) {
      chunks.push({
        id: generateChunkId(section.heading, globalIndex),
        heading: section.heading,
        content: section.content,
        sourcePath,
        offsetStart: section.startOffset,
        offsetEnd: section.endOffset,
        tokenCount: sectionTokens,
      });
      globalIndex++;
    } else {
      // Section is too large, split it
      const sectionChunks = chunkLargeSection(section, sourcePath, globalIndex);
      chunks.push(...sectionChunks);
      globalIndex += sectionChunks.length;
    }
  }

  return chunks;
}

/**
 * Merge small adjacent sections with the same heading level
 */
export function mergeSmallSections(sections: ParsedSection[]): ParsedSection[] {
  if (sections.length === 0) return [];

  const merged: ParsedSection[] = [];
  let current = { ...sections[0] };

  for (let i = 1; i < sections.length; i++) {
    const next = sections[i];
    const currentTokens = countTokens(current.content);
    const nextTokens = countTokens(next.content);

    // If both are small and same level, merge them
    if (
      currentTokens < config.minChunkTokens &&
      nextTokens < config.minChunkTokens &&
      current.level === next.level &&
      currentTokens + nextTokens <= config.maxChunkTokens
    ) {
      current.content += `\n\n${next.heading}\n\n${next.content}`;
      current.endOffset = next.endOffset;
    } else {
      merged.push(current);
      current = { ...next };
    }
  }

  merged.push(current);
  return merged;
}
