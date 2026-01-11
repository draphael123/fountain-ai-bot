import { NextRequest, NextResponse } from "next/server";
import { askStream } from "@/lib/llm/generate";
import { config, validateConfig } from "@/lib/config";

export const runtime = "nodejs";

interface AskRequest {
  question: string;
  topK?: number;
  strict?: boolean;
  stream?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Log config for debugging (redact sensitive data)
    console.log("Config check:", {
      llmProvider: config.llmProvider,
      hasOpenAIKey: !!config.openaiApiKey,
      openAIKeyLength: config.openaiApiKey?.length || 0,
      openAIKeyPrefix: config.openaiApiKey?.slice(0, 10) || "not set",
      model: config.openaiModel,
    });

    // Validate configuration first
    const configValidation = validateConfig();
    if (!configValidation.valid) {
      console.error("Config validation failed:", configValidation.errors);
      return NextResponse.json(
        { error: `Configuration error: ${configValidation.errors.join(", ")}` },
        { status: 500 }
      );
    }

    const body = (await request.json()) as AskRequest;

    // Validate input
    if (!body.question || typeof body.question !== "string") {
      return NextResponse.json(
        { error: "Question is required and must be a string" },
        { status: 400 }
      );
    }

    if (body.question.trim().length === 0) {
      return NextResponse.json(
        { error: "Question cannot be empty" },
        { status: 400 }
      );
    }

    if (body.question.length > 2000) {
      return NextResponse.json(
        { error: "Question is too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    const options = {
      topK: body.topK ?? 5,
      strict: body.strict ?? true,
    };

    // Always use streaming for better UX
    const askResult = askStream(body.question, options);
    const { readable, citations, retrieved } = await askResult.stream();

    // Create a TransformStream to prepend citations as JSON
    const encoder = new TextEncoder();
    const citationsJson = JSON.stringify({ citations, retrieved });
    
    // Custom stream that sends metadata first, then the answer
    const transformStream = new TransformStream({
      start(controller) {
        // Send citations as first chunk (prefixed with special marker)
        controller.enqueue(encoder.encode(`__CITATIONS__${citationsJson}__END_CITATIONS__`));
      },
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
    });

    const transformedStream = readable.pipeThrough(transformStream);

    return new Response(transformedStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Ask API error:", error);
    
    // Get detailed error info
    const message = error instanceof Error ? error.message : "Unknown error";
    const errorName = error instanceof Error ? error.name : "Unknown";
    const stack = error instanceof Error ? error.stack : "";
    
    console.error("Error details:", { name: errorName, message, stack });
    
    // Check for OpenAI specific errors
    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as { status: number; message?: string; code?: string };
      console.error("API Error status:", apiError.status, "code:", apiError.code);
      
      if (apiError.status === 401) {
        return NextResponse.json(
          { error: "Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable." },
          { status: 500 }
        );
      }
      
      if (apiError.status === 429) {
        return NextResponse.json(
          { error: "OpenAI rate limit or quota exceeded. Please try again later or check your billing." },
          { status: 429 }
        );
      }
      
      if (apiError.status === 500 || apiError.status === 503) {
        return NextResponse.json(
          { error: "OpenAI service temporarily unavailable. Please try again." },
          { status: 503 }
        );
      }
    }
    
    // Check for specific error messages
    if (message.includes("API key") || message.includes("apiKey") || message.includes("Incorrect API key") || message.includes("invalid_api_key")) {
      return NextResponse.json(
        { error: "OpenAI API key is missing or invalid. Please check your OPENAI_API_KEY environment variable." },
        { status: 500 }
      );
    }
    
    if (message.includes("No chunks") || message.includes("not ingested") || message.includes("No data")) {
      return NextResponse.json(
        { error: "Document has not been ingested. Please run 'npm run ingest' first." },
        { status: 400 }
      );
    }

    if (message.includes("rate limit") || message.includes("429") || message.includes("quota")) {
      return NextResponse.json(
        { error: "OpenAI API quota exceeded. Please check your billing at platform.openai.com" },
        { status: 429 }
      );
    }

    if (message.includes("ENOTFOUND") || message.includes("ECONNREFUSED") || message.includes("network") || message.includes("fetch failed")) {
      return NextResponse.json(
        { error: "Network error connecting to OpenAI. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `Failed to process question: ${message}` },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS (Chrome extension support)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
