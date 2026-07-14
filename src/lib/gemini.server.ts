type GeminiContent = {
  role?: "user" | "model";
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
};

type GeminiTextResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

type GeminiImageResponse = {
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
  const parts: GeminiContent["parts"] = [{ text: options.prompt }];
  if (options.image) {
    parts.push({ inlineData: dataUrlToInlineData(options.image) });
  }

  const data = await callGemini<GeminiImageResponse>("gemini-2.0-flash-preview-image-generation", {
    contents: [{ role: "user", parts }],
    generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
  });

  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData?.data || part.inline_data?.data,
  );
  const inline = imagePart?.inlineData ?? (imagePart?.inline_data
    ? { mimeType: imagePart.inline_data.mime_type, data: imagePart.inline_data.data }
    : undefined);

  if (!inline?.data) throw new Error("No image returned");
  return `data:${inline.mimeType ?? "image/png"};base64,${inline.data}`;
}