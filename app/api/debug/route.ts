import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { hasData, getChunkCount, getMetadata } from "@/lib/db/static-store";

export const runtime = "nodejs";

export async function GET() {
  // Check static data
  const dataExists = hasData();
  const chunkCount = getChunkCount();
  const metadata = getMetadata();

  // Try a direct fetch to OpenAI to test connectivity
  let openaiTest = "not tested";
  let fetchTest = "not tested";
  
  try {
    if (config.openaiApiKey) {
      // Direct fetch test
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${config.openaiApiKey}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        fetchTest = `success - ${data.data?.length || 0} models`;
      } else {
        const errorText = await response.text();
        fetchTest = `HTTP ${response.status}: ${errorText.slice(0, 200)}`;
      }
    }
  } catch (e) {
    fetchTest = `fetch error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Try a simple embedding call
  let embeddingTest = "not tested";
  try {
    if (config.openaiApiKey) {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: "test",
        }),
      });
      
      if (response.ok) {
        embeddingTest = "success";
      } else {
        const errorText = await response.text();
        embeddingTest = `HTTP ${response.status}: ${errorText.slice(0, 200)}`;
      }
    }
  } catch (e) {
    embeddingTest = `error: ${e instanceof Error ? e.message : String(e)}`;
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
    fetchTest,
    embeddingTest,
  });
}
