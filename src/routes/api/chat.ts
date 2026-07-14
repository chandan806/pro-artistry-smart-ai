import { createFileRoute } from "@tanstack/react-router";
import { generateGeminiText } from "@/lib/gemini.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            messages: Array<{ role: string; parts?: Array<{ type: string; text?: string }>; content?: string }>;
          };
          const msgs = (body.messages ?? []).map((m) => ({
            role: m.role as "user" | "assistant" | "system",
            content:
              m.content ??
              (m.parts?.filter((p) => p.type === "text").map((p) => p.text ?? "").join("") ?? ""),
          }));
          const text = await generateGeminiText({
            system:
              "You are Nova, an elite AI creative co-pilot inside a premium creative platform. Help users craft prompts, brainstorm designs, write content, and guide them across image, video, and design tools. Be concise, warm, and inspiring.",
            messages: msgs,
          });
          return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
        } catch (e) {
          return new Response(`Chat error: ${(e as Error).message}`, { status: 500 });
        }
      },
    },
  },
});
