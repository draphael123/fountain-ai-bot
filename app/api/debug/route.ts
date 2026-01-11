import { NextResponse } from "next/server";
import { config } from "@/lib/config";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    hasOpenAIKey: !!config.openaiApiKey,
    keyLength: config.openaiApiKey?.length || 0,
    keyPrefix: config.openaiApiKey?.slice(0, 8) || "not set",
    llmProvider: config.llmProvider,
    model: config.openaiModel,
    embeddingModel: config.openaiEmbeddingModel,
    envCheck: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `set (${process.env.OPENAI_API_KEY.length} chars)` : "NOT SET",
      Open_API_Key: process.env.Open_API_Key ? `set (${process.env.Open_API_Key.length} chars)` : "NOT SET",
    }
  });
}

