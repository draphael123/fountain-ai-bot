import { parseDocx } from "./docx-parser";
import { chunkSections, mergeSmallSections } from "./chunker";
import { embedTexts } from "@/lib/retrieval/embeddings";
import { saveStaticData, type StoredChunk, type StaticData } from "@/lib/db/static-store";
import { config } from "@/lib/config";
import path from "path";

export interface IngestResult {
  success: boolean;
  documentPath: string;
  sectionCount: number;
  chunkCount: number;
  totalTokens: number;
  timestamp: string;
  errors: string[];
}

/**
 * Run the full ingestion pipeline
 */
export async function ingestDocument(
  documentPath?: string
): Promise<IngestResult> {
  const docPath = documentPath || config.documentPath;
  const errors: string[] = [];
  const timestamp = new Date().toISOString();

  console.log(`\n📄 Starting document ingestion: ${docPath}`);

  try {
    // Step 1: Parse DOCX
    console.log("  → Parsing DOCX file...");
    const sections = await parseDocx(docPath);
    console.log(`    Found ${sections.length} sections`);

    if (sections.length === 0) {
      throw new Error("No content found in document");
    }

    // Step 2: Merge small sections
    console.log("  → Merging small sections...");
    const mergedSections = mergeSmallSections(sections);
    console.log(`    Merged to ${mergedSections.length} sections`);

    // Step 3: Chunk sections
    console.log("  → Chunking sections...");
    const chunks = chunkSections(mergedSections, path.basename(docPath));
    console.log(`    Created ${chunks.length} chunks`);

    // Step 4: Generate embeddings
    console.log("  → Generating embeddings (this may take a moment)...");
    const contents = chunks.map((c) => `${c.heading}\n\n${c.content}`);
    const embeddings = await embedTexts(contents);
    console.log(`    Generated ${embeddings.length} embeddings`);

    // Step 5: Create stored chunks with embeddings
    const storedChunks: StoredChunk[] = chunks.map((chunk, i) => ({
      id: chunk.id,
      heading: chunk.heading,
      content: chunk.content,
      source_path: chunk.sourcePath,
      offset_start: chunk.offsetStart,
      offset_end: chunk.offsetEnd,
      token_count: chunk.tokenCount,
      embedding: embeddings[i],
    }));

    // Step 6: Calculate totals and save
    const totalTokens = chunks.reduce((sum, c) => sum + c.tokenCount, 0);
    
    const staticData: StaticData = {
      chunks: storedChunks,
      metadata: {
        document_name: path.basename(docPath),
        document_path: docPath,
        google_doc_url: config.googleDocUrl || undefined,
        section_count: mergedSections.length,
        chunk_count: chunks.length,
        total_tokens: totalTokens,
        ingested_at: timestamp,
      },
    };

    saveStaticData(staticData);

    console.log(`\n✅ Ingestion complete!`);
    console.log(`   Sections: ${mergedSections.length}`);
    console.log(`   Chunks: ${chunks.length}`);
    console.log(`   Total tokens: ${totalTokens.toLocaleString()}`);
    console.log(`   Data saved to: data/embedded-data.json`);

    return {
      success: true,
      documentPath: docPath,
      sectionCount: mergedSections.length,
      chunkCount: chunks.length,
      totalTokens,
      timestamp,
      errors: [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Ingestion failed: ${message}`);
    errors.push(message);

    return {
      success: false,
      documentPath: docPath,
      sectionCount: 0,
      chunkCount: 0,
      totalTokens: 0,
      timestamp,
      errors,
    };
  }
}

/**
 * Check if document has been ingested
 */
export function isDocumentIngested(): boolean {
  try {
    const { hasData } = require("@/lib/db/static-store");
    return hasData();
  } catch {
    return false;
  }
}
