import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { ingestDocument } from "@/lib/ingest/pipeline";

export const runtime = "nodejs";

export async function POST() {
  // Only allow in dev mode
  if (!config.devMode) {
    return NextResponse.json(
      { error: "Ingestion is only available in dev mode" },
      { status: 403 }
    );
  }

  try {
    const result = await ingestDocument();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Document ingested successfully",
        documentPath: result.documentPath,
        sectionCount: result.sectionCount,
        chunkCount: result.chunkCount,
        totalTokens: result.totalTokens,
        timestamp: result.timestamp,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Ingestion failed",
          errors: result.errors,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Ingest API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { success: false, message, errors: [message] },
      { status: 500 }
    );
  }
}

