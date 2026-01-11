import { config } from "@/lib/config";

export interface GenerateOptions {
  system: string;
  user: string;
  maxTokens?: number;
}

export interface StreamGenerateOptions extends GenerateOptions {
  onChunk: (chunk: string) => void;
  onDone: () => void;
}

/**
 * Parse OpenAI error response for user-friendly messages
 */
function parseOpenAIError(status: number, errorText: string): string {
  try {
    const parsed = JSON.parse(errorText);
    const errorMessage = parsed.error?.message || errorText;
    const errorCode = parsed.error?.code || "";
    
    if (status === 401 || errorCode === "invalid_api_key") {
      return "Invalid API key. Please verify your OpenAI API key is correct and active.";
    }
    if (status === 429) {
      if (errorMessage.includes("quota")) {
        return "OpenAI API quota exceeded. Please add credits at platform.openai.com/account/billing";
      }
      return "Rate limit reached. Please wait a moment and try again.";
    }
    if (status === 500 || status === 503) {
      return "OpenAI service is temporarily unavailable. Please try again in a few moments.";
    }
    if (status === 400) {
      if (errorMessage.includes("context_length")) {
        return "The question and context are too long. Please try a shorter question.";
      }
      return `Invalid request: ${errorMessage}`;
    }
    if (status === 404) {
      return `Model not found. Please check your model configuration. Current model: ${config.openaiModel}`;
    }
    return `OpenAI error (${status}): ${errorMessage}`;
  } catch {
    return `OpenAI API error (${status}): ${errorText}`;
  }
}

/**
 * Handle fetch errors with user-friendly messages
 */
function handleFetchError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  
  if (message.includes("fetch failed") || message.includes("ENOTFOUND")) {
    throw new Error(
      "Unable to connect to OpenAI. Please check your internet connection."
    );
  }
  if (message.includes("ECONNREFUSED")) {
    throw new Error(
      "Connection to OpenAI was refused. Please try again later."
    );
  }
  if (message.includes("ETIMEDOUT") || message.includes("timeout")) {
    throw new Error(
      "Request to OpenAI timed out. Please try again."
    );
  }
  throw new Error(`Network error: ${message}`);
}

/**
 * Generate a non-streaming response using direct fetch
 */
export async function generate(options: GenerateOptions): Promise<string> {
  const { system, user, maxTokens = 2048 } = options;

  if (!config.openaiApiKey) {
    throw new Error(
      "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable."
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.openaiModel,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch (error) {
    handleFetchError(error);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(parseOpenAIError(response.status, errorText));
  }

  const data = await response.json();
  
  if (!data.choices?.[0]?.message?.content) {
    throw new Error("Unexpected response from OpenAI: no content in response");
  }
  
  return data.choices[0].message.content;
}

/**
 * Generate a streaming response using direct fetch
 */
export async function generateStream(options: StreamGenerateOptions): Promise<void> {
  const { system, user, maxTokens = 2048, onChunk, onDone } = options;

  if (!config.openaiApiKey) {
    throw new Error(
      "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable."
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.openaiModel,
        max_tokens: maxTokens,
        stream: true,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch (error) {
    handleFetchError(error);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(parseOpenAIError(response.status, errorText));
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Unable to read response stream. Please try again.");
  }

  const decoder = new TextDecoder();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(line => line.trim() !== "");
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch {
            // Skip invalid JSON lines (normal for SSE)
          }
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Error reading response stream: ${message}`);
  }

  onDone();
}

/**
 * Create a ReadableStream for streaming responses (for API routes)
 */
export function createStreamResponse(options: GenerateOptions): ReadableStream {
  const { system, user, maxTokens = 2048 } = options;

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        if (!config.openaiApiKey) {
          throw new Error(
            "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable."
          );
        }

        let response: Response;
        try {
          response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${config.openaiApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: config.openaiModel,
              max_tokens: maxTokens,
              stream: true,
              messages: [
                { role: "system", content: system },
                { role: "user", content: user },
              ],
            }),
          });
        } catch (error) {
          handleFetchError(error);
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(parseOpenAIError(response.status, errorText));
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Unable to read response stream. Please try again.");
        }

        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(line => line.trim() !== "");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch {
                // Skip invalid JSON lines (normal for SSE)
              }
            }
          }
        }

        controller.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Send error as text to the stream so the client can see it
        controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`));
        controller.close();
      }
    },
  });
}
