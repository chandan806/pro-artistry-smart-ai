type GeminiContent = {
  role?: "user" | "model";
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
};

type GeminiTextResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

type GeminiImageResponse = {
  output_image?: { mime_type?: string; mimeType?: string; data?: string };
  outputImage?: { mime_type?: string; mimeType?: string; data?: string };
  outputs?: Array<{ type?: string; mime_type?: string; mimeType?: string; data?: string }>;
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: { mimeType?: string; data?: string };
        inline_data?: { mime_type?: string; data?: string };
      }>;
    };
  }>;
  error?: { message?: string };
};

function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return key;
}

function dataUrlToInlineData(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Uploaded image format is not supported");
  return { mimeType: match[1], data: match[2] };
}

async function callGemini<T>(model: string, body: unknown): Promise<T> {
  const key = getGeminiKey();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify(body),
    },
  );

  const text = await response.text();
  let data: GeminiTextResponse | GeminiImageResponse | undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    throw new Error(data?.error?.message ?? text ?? `Gemini request failed (${response.status})`);
  }

  return data as T;
}

async function callGeminiInteraction<T>(body: unknown): Promise<T> {
  const key = getGeminiKey();
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data: GeminiImageResponse | undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    throw new Error(data?.error?.message ?? text ?? `Gemini image request failed (${response.status})`);
  }

  return data as T;
}

export async function generateGeminiText(options: {
  system?: string;
  messages: Array<{ role: string; content: string }>;
}) {
  const contents: GeminiContent[] = options.messages
    .filter((message) => message.role !== "system" && message.content.trim())
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

  const systemText = [
    options.system,
    ...options.messages.filter((message) => message.role === "system").map((message) => message.content),
  ]
    .filter(Boolean)
    .join("\n\n");

  const data = await callGemini<GeminiTextResponse>("gemini-2.5-flash", {
    contents,
    ...(systemText ? { systemInstruction: { parts: [{ text: systemText }] } } : {}),
  });

  const output = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!output) throw new Error("No AI response returned");
  return output;
}

export async function generateGeminiImage(options: { prompt: string; image?: string }) {
  const input: Array<{ type: "text"; text: string } | { type: "image"; mime_type: string; data: string }> = [
    { type: "text", text: options.prompt },
  ];
  if (options.image) {
    const inline = dataUrlToInlineData(options.image);
    input.push({ type: "image", mime_type: inline.mimeType, data: inline.data });
  }

  const data = await callGeminiInteraction<GeminiImageResponse>({
    model: "gemini-3.1-flash-image",
    input,
  });

  const outputImage = data.output_image ?? data.outputImage;
  if (outputImage?.data) {
    return `data:${outputImage.mime_type ?? outputImage.mimeType ?? "image/png"};base64,${outputImage.data}`;
  }

  const output = data.outputs?.find((item) => item.type === "image" && item.data);
  if (output?.data) {
    return `data:${output.mime_type ?? output.mimeType ?? "image/png"};base64,${output.data}`;
  }

  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData?.data || part.inline_data?.data,
  );
  const inline = imagePart?.inlineData ?? (imagePart?.inline_data
    ? { mimeType: imagePart.inline_data.mime_type, data: imagePart.inline_data.data }
    : undefined);

  if (!inline?.data) throw new Error("No image returned");
  return `data:${inline.mimeType ?? "image/png"};base64,${inline.data}`;
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
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <rect width="1024" height="1024" fill="url(#glow)"/>
  <g opacity="0.18" fill="none" stroke="#fff" stroke-width="2">
    <path d="M120 210C330 80 590 90 856 214"/>
    <path d="M96 734c242 138 526 134 834-12"/>
    <circle cx="202" cy="262" r="86"/>
    <circle cx="812" cy="762" r="124"/>
  </g>
  <g filter="url(#shadow)">
    <rect x="112" y="168" width="800" height="688" rx="42" fill="#111827" opacity="0.62"/>
    <rect x="138" y="194" width="748" height="636" rx="32" fill="#ffffff" opacity="0.1"/>
  </g>
  <text x="512" y="438" text-anchor="middle" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="800">
    ${escapeSvg(title)}
  </text>
  <text x="512" y="516" text-anchor="middle" fill="#eef2ff" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="500">
    ${escapeSvg(subtitle || "Premium generated visual")}
  </text>
  <text x="512" y="702" text-anchor="middle" fill="#fff" opacity="0.82" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">
    ArtistrySmartAI
  </text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function escapeSvg(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}