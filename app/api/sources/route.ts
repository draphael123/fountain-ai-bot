import { NextResponse } from "next/server";
import { getMetadata, getChunkCount, getUniqueHeadings, hasData } from "@/lib/db/static-store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const ingested = hasData();
    const metadata = getMetadata();
    const chunkCount = getChunkCount();
    const headings = getUniqueHeadings();

    return NextResponse.json({
      ingested,
      documentName: metadata?.document_name || null,
      documentPath: metadata?.document_path || null,
      googleDocUrl: metadata?.google_doc_url || null,
      chunkCount,
      sectionCount: metadata?.section_count || 0,
      totalTokens: metadata?.total_tokens || 0,
      ingestedAt: metadata?.ingested_at || null,
      headings,
    });
  } catch (error) {
    console.error("Sources API error:", error);
    
    // Return empty state on error
    return NextResponse.json({
      ingested: false,
      documentName: null,
      documentPath: null,
      googleDocUrl: null,
      chunkCount: 0,
      sectionCount: 0,
      totalTokens: 0,
      ingestedAt: null,
      headings: [],
    });
  }
}
