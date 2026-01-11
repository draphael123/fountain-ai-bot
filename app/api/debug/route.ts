import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { hasData, getChunkCount, getMetadata } from "@/lib/db/static-store";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function GET() {
  // Check static data
  const dataExists = hasData();
  const chunkCount = getChunkCount();
  const metadata = getMetadata();

  // Try a simple OpenAI call to test connectivity
  let openaiTest = "not tested";
  try {
    if (config.openaiApiKey) {
      const openai = new OpenAI({ apiKey: config.openaiApiKey });
      const models = await openai.models.list();
      openaiTest = `success - ${models.data.length} models available`;
    }
  } catch (e) {
    openaiTest = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({
    hasOpenAIKey: !!config.openaiApiKey,
    keyLength: config.openaiApiKey?.length || 0,
    keyPrefix: config.openaiApiKey?.slice(0, 8) || "not set",
    llmProvider: config.llmProvider,
    model: config.openaiModel,
    embeddingModel: config.openaiEmbeddingModel,
    staticData: {
      hasData: dataExists,
      chunkCount,
      documentName: metadata?.document_name || null,
    },
    openaiTest,
    envCheck: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `set (${process.env.OPENAI_API_KEY.length} chars)` : "NOT SET",
    }
  });
}

