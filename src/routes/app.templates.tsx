import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layers, Sparkles, Loader2, Download } from "lucide-react";
import AssistantWidget from "@/components/AssistantWidget";

export const Route = createFileRoute("/app/templates")({
  component: TemplatesPage,
});

const CATS = [
  { name: "Festival", prompt: "festive Indian festival poster, diyas, rangoli, warm gold and red palette" },
  { name: "Temple", prompt: "spiritual temple poster, mandala, sacred geometry, saffron and gold" },
  { name: "Wedding", prompt: "elegant wedding invitation, floral, pastel palette, luxury typography" },
  { name: "Birthday", prompt: "playful birthday poster, balloons, confetti, cheerful colors" },
  { name: "Business", prompt: "corporate business flyer, modern, blue and white, clean layout" },
  { name: "Education", prompt: "education / coaching poster, books, students, motivational" },
  { name: "YouTube", prompt: "high-CTR YouTube thumbnail, bold face reaction, dramatic text, 16:9" },
  { name: "Instagram", prompt: "trendy Instagram square post, aesthetic, on-brand, gen-z visual" },
  { name: "Facebook", prompt: "Facebook cover banner, wide, brand promotional" },
  { name: "WhatsApp", prompt: "WhatsApp status square, motivational, minimal, bold quote" },
  { name: "Marketing", prompt: "marketing sale poster, discount tag, bold percentage, punchy colors" },
  { name: "Real Estate", prompt: "real estate property flyer, modern home, elegant, luxury" },
  { name: "Restaurant", prompt: "restaurant menu / promo poster, food photography, appetizing" },
  { name: "Fashion", prompt: "fashion editorial poster, model, high-end magazine cover" },
  { name: "Gaming", prompt: "gaming thumbnail, neon, esports style, dynamic action" },
  { name: "Travel", prompt: "travel destination poster, scenic, wanderlust, cinematic" },
  { name: "Healthcare", prompt: "healthcare / clinic flyer, trustworthy, blue palette, professional" },
];

function TemplatesPage() {
  const [active, setActive] = useState(CATS[0].name);
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function makeTemplate(cat: (typeof CATS)[number]) {
    if (loading) return;
    setActive(cat.name);
    setLoading(cat.name);
    setError(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${cat.prompt}. Editable template style, agency-quality, premium design, print-ready.`,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { image: string };
      setImages((m) => ({ ...m, [cat.name]: data.image }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-10 md:py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
          <Layers className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Template Library</h1>
          <p className="text-sm text-muted-foreground">Tap any category to generate a fresh, premium template.</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button
            key={c.name}
            onClick={() => setActive(c.name)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              active === c.name ? "bg-gradient-brand text-primary-foreground shadow-glow" : "glass"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-xs text-red-400">Error: {error}</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {CATS.map((c) => {
          const img = images[c.name];
          const isLoading = loading === c.name;
          return (
            <div key={c.name} className="glass overflow-hidden rounded-2xl">
              <div className="relative aspect-[3/4] bg-muted/20">
                {img ? (
                  <img src={img} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-brand" />
                    ) : (
                      <Sparkles className="h-6 w-6 text-brand" />
                    )}
                    <div className="mt-2 px-2 text-xs">{c.name}</div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-2">
                <button
                  onClick={() => makeTemplate(c)}
                  disabled={!!loading}
                  className="flex-1 rounded-lg bg-gradient-brand px-2 py-1.5 text-xs font-medium text-primary-foreground shadow-glow disabled:opacity-50"
                >
                  {isLoading ? "Generating…" : img ? "Regenerate" : "Generate"}
                </button>
                {img && (
                  <a
                    href={img}
                    download={`${c.name}-template.png`}
                    className="grid h-7 w-7 place-items-center rounded-lg glass"
                    title="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <AssistantWidget toolName={"Template Library"} capabilities={`• 17 categories of ready-to-use templates
• Instagram, YouTube, LinkedIn, TikTok
• Business, e-commerce, education, events
• Generated fresh on demand, unlimited`} />
    </div>
  );
}