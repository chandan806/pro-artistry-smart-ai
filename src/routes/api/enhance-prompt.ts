import { createFileRoute } from "@tanstack/react-router";
import { generateGeminiText } from "@/lib/gemini.server";

export const Route = createFileRoute("/api/enhance-prompt")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            prompt?: string;
            mode?: "enhance" | "generate";
            style?: string;
          };
          const mode = body.mode ?? "enhance";
          const style = body.style ?? "cinematic";

          const system =
            mode === "generate"
              ? "You are an elite video prompt writer. Invent ONE vivid, original video prompt. Reply with ONLY the prompt text, 1-3 sentences, no quotes, no preface."
              : "You are an elite video prompt engineer. Rewrite the user's prompt into a rich, specific, cinematic video prompt with subject, action, environment, lighting, camera, and mood. Reply with ONLY the improved prompt, 1-3 sentences, no quotes, no preface.";

          const user =
            mode === "generate"
              ? `Style: ${style}. Give me a stunning video idea.`
              : `Style: ${style}. Prompt: ${body.prompt ?? ""}`;

          const text = await generateGeminiText({
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
          });
          return Response.json({ prompt: text });
        } catch (e) {
          return new Response(`Prompt error: ${(e as Error).message}`, { status: 500 });
        }
      },
    },
  },
});
