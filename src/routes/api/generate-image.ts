import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const body = (await request.json()) as {
          prompt: string;
          image?: string; // data URL for edit mode
        };
        if (!body.prompt) return new Response("Missing prompt", { status: 400 });

        const content: Array<Record<string, unknown>> = [
          { type: "text", text: body.prompt },
        ];
        if (body.image) {
          content.push({ type: "image_url", image_url: { url: body.image } });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content }],
            modalities: ["image", "text"],
          }),
        });

        if (!upstream.ok) {
          const text = await upstream.text();
          return new Response(text, { status: upstream.status });
        }
        const data = (await upstream.json()) as {
          choices?: Array<{
            message?: {
              images?: Array<{ image_url?: { url?: string } }>;
            };
          }>;
        };
        const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (!url) return new Response("No image returned", { status: 502 });
        return Response.json({ image: url });
      },
    },
  },
});
