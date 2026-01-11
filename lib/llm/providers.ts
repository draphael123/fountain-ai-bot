import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "@/lib/config";

// Provider clients (lazy initialized)
let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    if (!config.openaiApiKey) {
      throw new Error("OPENAI_API_KEY is required");
    }
    openaiClient = new OpenAI({ apiKey: config.openaiApiKey });
  }
  return openaiClient;
}

function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    if (!config.anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY is required");
    }
    anthropicClient = new Anthropic({ apiKey: config.anthropicApiKey });
  }
  return anthropicClient;
}

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
 * Generate a non-streaming response
 */
export async function generate(options: GenerateOptions): Promise<string> {
  const { system, user, maxTokens = 2048 } = options;

  if (config.llmProvider === "anthropic") {
    const client = getAnthropic();
    const response = await client.messages.create({
      model: config.anthropicModel,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock ? textBlock.text : "";
  } else {
    const client = getOpenAI();
    const response = await client.chat.completions.create({
      model: config.openaiModel,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    return response.choices[0]?.message?.content || "";
  }
}

/**
 * Generate a streaming response
 */
export async function generateStream(
  options: StreamGenerateOptions
): Promise<void> {
  const { system, user, maxTokens = 2048, onChunk, onDone } = options;

  if (config.llmProvider === "anthropic") {
    const client = getAnthropic();

    const stream = await client.messages.stream({
      model: config.anthropicModel,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        onChunk(event.delta.text);
      }
    }

    onDone();
  } else {
    const client = getOpenAI();

    const stream = await client.chat.completions.create({
      model: config.openaiModel,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
      }
    }

    onDone();
  }
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
        if (config.llmProvider === "anthropic") {
          const client = getAnthropic();

          const stream = await client.messages.stream({
            model: config.anthropicModel,
            max_tokens: maxTokens,
            system,
            messages: [{ role: "user", content: user }],
          });

          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } else {
          const client = getOpenAI();

          const stream = await client.chat.completions.create({
            model: config.openaiModel,
            max_tokens: maxTokens,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            stream: true,
          });

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

