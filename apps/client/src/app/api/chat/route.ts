import { createAgentUIStreamResponse } from "ai";
import type { NextRequest } from "next/server";
import { getAgent, type ModelType } from "@/lib/agent";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { messages, model, thinkingEnabled } = await request.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the selected agent based on model and thinking mode
    const selectedModel = (model || "Sonnet 4.5") as ModelType;
    const agent = getAgent(selectedModel, thinkingEnabled || false);

    // Stream the response using AI SDK v6 agent
    return createAgentUIStreamResponse({
      agent,
      messages,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
