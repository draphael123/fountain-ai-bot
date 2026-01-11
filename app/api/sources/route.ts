import { NextResponse } from "next/server";
import { getMetadata, getAllMetadata, getChunkCount, getAllChunks, ensureDbInitialized } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Ensure database is initialized
    await ensureDbInitialized();
    
    const metadata = getAllMetadata();
    const chunkCount = getChunkCount();
    
    // Convert metadata array to object
    const metadataObj = metadata.reduce(
      (acc, { key, value }) => ({ ...acc, [key]: value }),
      {} as Record<string, string>
    );

    // Get unique headings from chunks
    const chunks = getAllChunks();
    const headings = [...new Set(chunks.map((c) => c.heading))];

    return NextResponse.json({
      ingested: chunkCount > 0,
      documentName: metadataObj.document_name || null,
      documentPath: metadataObj.document_path || null,
      chunkCount,
      sectionCount: parseInt(metadataObj.section_count || "0"),
      totalTokens: parseInt(metadataObj.total_tokens || "0"),
      ingestedAt: metadataObj.ingested_at || null,
      headings,
    });
  } catch (error) {
    console.error("Sources API error:", error);
    
    // If database doesn't exist yet, return empty state
    return NextResponse.json({
      ingested: false,
      documentName: null,
      documentPath: null,
      chunkCount: 0,
      sectionCount: 0,
      totalTokens: 0,
      ingestedAt: null,
      headings: [],
    });
  }
}
