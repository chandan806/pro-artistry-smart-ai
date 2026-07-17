// AI provider layer — powered by OpenRouter for unified access to top models.
// Kept the filename for backwards compatibility with existing imports.

type ChatMessage = { role: string; content: string };

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: string; images?: Array<{ image_url?: { url?: string } }> } }>;
  error?: { message?: string };
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const TEXT_MODEL = "google/gemini-2.5-flash";
const IMAGE_MODEL = "google/gemini-2.5-flash-image";

function getKey() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not configured");
  return key;
}

async function callOpenRouter(body: unknown): Promise<OpenRouterResponse> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://artistrysmartai.com",
      "X-Title": "Artistry Smart AI",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: OpenRouterResponse | undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }
  if (!res.ok) {
    throw new Error(data?.error?.message ?? text ?? `OpenRouter request failed (${res.status})`);
  }
  return data ?? {};
}

export async function generateGeminiText(options: {
  system?: string;
  messages: ChatMessage[];
}) {
  const messages: Array<{ role: string; content: string }> = [];
  const systemText = [
    options.system,
    ...options.messages.filter((m) => m.role === "system").map((m) => m.content),
  ]
    .filter(Boolean)
    .join("\n\n");
  if (systemText) messages.push({ role: "system", content: systemText });
  for (const m of options.messages) {
    if (m.role === "system") continue;
    if (!m.content?.trim()) continue;
    messages.push({ role: m.role === "assistant" ? "assistant" : "user", content: m.content });
  }

  const data = await callOpenRouter({ model: TEXT_MODEL, messages });
  const output = data.choices?.[0]?.message?.content?.trim();
  if (!output) throw new Error("No AI response returned");
  return output;
}

function dataUrlParts(dataUrl: string) {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error("Uploaded image format is not supported");
  return { mimeType: m[1], data: m[2] };
}

export async function generateGeminiImage(options: { prompt: string; image?: string }) {
  const content: Array<Record<string, unknown>> = [{ type: "text", text: options.prompt }];
  if (options.image) {
    const { mimeType, data } = dataUrlParts(options.image);
    content.push({ type: "image_url", image_url: { url: `data:${mimeType};base64,${data}` } });
  }

  const data = await callOpenRouter({
    model: IMAGE_MODEL,
    modalities: ["image", "text"],
    messages: [{ role: "user", content }],
  });

  const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error("No image returned");
  return url;
}

export function generateFallbackImage(prompt: string) {
  const clean = prompt.replace(/\s+/g, " ").trim().slice(0, 180) || "AI creation";
  let hash = 0;
  for (const char of clean) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const hueA = hash % 360;
  const hueB = (hueA + 95) % 360;
  const hueC = (hueA + 190) % 360;
  const words = clean.split(" ");
  const title = words.slice(0, 8).join(" ");
  const subtitle = words.slice(8, 18).join(" ");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hueA} 84% 54%)"/>
      <stop offset="0.52" stop-color="hsl(${hueB} 78% 48%)"/>
      <stop offset="1" stop-color="hsl(${hueC} 88% 58%)"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="62%">
      <stop offset="0" stop-color="white" stop-opacity="0.42"/>
      <stop offset="1" stop-color="white" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <rect width="1024" height="1024" fill="url(#glow)"/>
  <text x="512" y="438" text-anchor="middle" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="800">${escapeSvg(title)}</text>
  <text x="512" y="516" text-anchor="middle" fill="#eef2ff" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="500">${escapeSvg(subtitle || "Premium generated visual")}</text>
  <text x="512" y="702" text-anchor="middle" fill="#fff" opacity="0.82" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">ArtistrySmartAI</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function escapeSvg(v: string) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
