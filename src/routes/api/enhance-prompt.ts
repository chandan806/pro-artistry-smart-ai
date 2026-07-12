import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/enhance-prompt")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
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

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
          }),
        });
        if (!upstream.ok) return new Response(await upstream.text(), { status: upstream.status });
        const data = (await upstream.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = data.choices?.[0]?.message?.content?.trim() ?? "";
        return Response.json({ prompt: text });
      },
    },
  },
});
