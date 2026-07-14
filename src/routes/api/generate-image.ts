import { createFileRoute } from "@tanstack/react-router";
import { generateFallbackImage, generateGeminiImage } from "@/lib/gemini.server";

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            prompt: string;
            image?: string; // data URL for edit mode
          };
          if (!body.prompt) return new Response("Missing prompt", { status: 400 });

          try {
            const image = await generateGeminiImage({ prompt: body.prompt, image: body.image });
            return Response.json({ image, mode: "ai" });
          } catch (error) {
            const image = generateFallbackImage(body.prompt);
            return Response.json({ image, mode: "fallback", note: (error as Error).message });
          }
        } catch (e) {
          return Response.json({ error: (e as Error).message }, { status: 500 });
        }
      },
    },
  },
});
