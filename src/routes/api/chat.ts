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
              attachments?: Array<{
                type: "image" | "pdf" | "text" | "file";
                name: string;
                mime: string;
                dataUrl?: string;
                text?: string;
              }>;
              parts?: Array<{ type: string; text?: string }>;
            }>;
          };
          const msgs = (body.messages ?? []).map((m) => ({
            role: m.role as "user" | "assistant" | "system",
            content:
              m.content ??
              (m.parts?.filter((p) => p.type === "text").map((p) => p.text ?? "").join("") ?? ""),
            images: m.images,
            attachments: m.attachments,
          }));
          const defaultSystem =
            "You are Nova — a world-class free AI assistant on ArtistrySmartAI. Primary fast text model is Tencent HY3 free; use free multimodal fallback for images/PDF/files. Help with ANY topic without limits: studies, homework, coding, exams, research, career, life advice, creative writing, prompts, business, translations, casual chat, daily updates, and all ArtistrySmartAI tools. If the user attaches camera photos, uploaded images, PDFs, text files, screenshots, pasted or dragged files, analyze them in detail, read visible text/OCR, summarize PDFs/files, answer questions, and suggest next creative actions. Respect saved memory. Reply in the user's language (English/Hindi/Hinglish). Be fast, warm, practical, and step-by-step when needed. Use markdown when helpful. Everything is free and unlimited for the user.";
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
