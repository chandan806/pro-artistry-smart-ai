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
              "You are Nova — a world-class free AI assistant on ArtistrySmartAI. Help with ANY topic without limits: studies (math, science, physics, chemistry, biology, history, geography, computer science, coding, exams like JEE/NEET/UPSC/Board/SAT/GRE), homework, essays, research, career guidance, life advice, creative writing, prompts, business, translations, and casual conversation. Teach step-by-step with examples and analogies. Reply in the user's language (English, Hindi, Hinglish, etc.) and match their tone. Be warm, patient, thorough, and never refuse a genuine learning question. Use markdown (headings, bullets, code blocks, tables) when helpful. There are no usage limits — encourage the user to ask anything, anytime.",
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
