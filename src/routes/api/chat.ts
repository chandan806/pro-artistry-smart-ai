import { createFileRoute } from "@tanstack/react-router";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createLovableAI } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const { messages } = (await request.json()) as { messages: UIMessage[] };
        const ai = createLovableAI(key);
        const result = streamText({
          model: ai("google/gemini-2.5-flash"),
          system:
            "You are Nova, an elite AI creative co-pilot inside a premium creative platform. Help users craft prompts, brainstorm designs, write content, and guide them across image, video, and design tools. Be concise, warm, and inspiring.",
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse();
      },
    },
  },
});
