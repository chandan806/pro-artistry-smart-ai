import { createFileRoute } from "@tanstack/react-router";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createLovableAI } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const key = process.env.LOVABLE_API_KEY;
          if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
          const body = (await request.json()) as {
            messages: Array<{ role: string; parts?: Array<{ type: string; text?: string }>; content?: string }>;
          };
          const msgs = (body.messages ?? []).map((m) => ({
            role: m.role as "user" | "assistant" | "system",
            content:
              m.content ??
              (m.parts?.filter((p) => p.type === "text").map((p) => p.text ?? "").join("") ?? ""),
          }));
          const ai = createLovableAI(key);
          const result = streamText({
            model: ai("google/gemini-2.5-flash"),
            system:
              "You are Nova, an elite AI creative co-pilot inside a premium creative platform. Help users craft prompts, brainstorm designs, write content, and guide them across image, video, and design tools. Be concise, warm, and inspiring.",
            messages: msgs,
          });
          return result.toTextStreamResponse();
        } catch (e) {
          return new Response(`Chat error: ${(e as Error).message}`, { status: 500 });
        }
      },
    },
  },
});
