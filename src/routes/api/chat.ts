import { createFileRoute } from "@tanstack/react-router";
import { generateGeminiText } from "@/lib/gemini.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            system?: string;
            messages: Array<{
              role: string;
              content?: string;
              images?: string[];
              parts?: Array<{ type: string; text?: string }>;
            }>;
          };
          const msgs = (body.messages ?? []).map((m) => ({
            role: m.role as "user" | "assistant" | "system",
            content:
              m.content ??
              (m.parts?.filter((p) => p.type === "text").map((p) => p.text ?? "").join("") ?? ""),
            images: m.images,
          }));
          const defaultSystem =
            "You are Nova — a world-class free AI assistant on ArtistrySmartAI. Help with ANY topic without limits: studies (math, science, physics, chemistry, biology, history, geography, CS, coding, exams like JEE/NEET/UPSC/Board/SAT/GRE), homework, essays, research, career, life advice, creative writing, prompts, business, translations, casual chat, and daily news/updates. If the user attaches images (camera, upload, drag-drop, paste, screenshot, or from any browser), describe them in rich detail, read text/OCR, identify objects/people/places/brands/scenes, answer questions, and suggest what to make next inside ArtistrySmartAI (edit, remove background, upscale, turn into a video, generate variations, design a poster). Teach step-by-step. Reply in the user's language (English/Hindi/Hinglish). Warm, patient, thorough — never refuse a genuine question. Use markdown when helpful. Everything is free and unlimited.";
          const text = await generateGeminiText({
            system: body.system ?? defaultSystem,
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
