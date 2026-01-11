import { NextRequest, NextResponse } from "next/server";
import { askStream } from "@/lib/llm/generate";

export const runtime = "nodejs";

interface AskRequest {
  question: string;
  topK?: number;
  strict?: boolean;
  stream?: boolean;
}

export async function POST(request: NextRequest) {
  try {
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
    
    const message = error instanceof Error ? error.message : "Unknown error";
    
    // Check for specific error types
    if (message.includes("API key")) {
      return NextResponse.json(
        { error: "API key configuration error" },
        { status: 500 }
      );
    }
    
    if (message.includes("No chunks") || message.includes("not ingested")) {
      return NextResponse.json(
        { error: "Document has not been ingested. Please run 'npm run ingest' first." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process question" },
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

