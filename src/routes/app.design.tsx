import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Palette, Loader2, Sparkles, Download } from "lucide-react";

export const Route = createFileRoute("/app/design")({
  component: DesignPage,
});

const KINDS = [
  { id: "logo", label: "Logo", hint: "minimalist vector logo on clean background, centered, professional brand mark" },
  { id: "poster", label: "Poster", hint: "eye-catching poster design, bold typography, print-ready composition" },
  { id: "thumbnail", label: "YouTube Thumbnail", hint: "high-CTR youtube thumbnail, bold text, expressive face, 16:9" },
  { id: "banner", label: "Banner", hint: "wide banner design, hero composition, marketing quality" },
  { id: "social", label: "Instagram Post", hint: "square instagram post, on-trend aesthetic, brand-friendly" },
  { id: "flyer", label: "Flyer", hint: "flyer/pamphlet, clear hierarchy, promotional layout" },
];

function DesignPage() {
  const [kind, setKind] = useState(KINDS[0]);
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    const p = prompt.trim();
    if (!p || loading) return;
    setLoading(true);
    setError(null);
    setImage(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${kind.hint}. Subject: ${p}. Premium, modern, agency-quality design.`,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { image: string };
      setImage(data.image);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-10 md:py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
          <Palette className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Graphic Designer</h1>
          <p className="text-sm text-muted-foreground">Logos, posters, thumbnails — one prompt, endless designs.</p>
        </div>
      </div>

      <div className="glass mb-6 rounded-2xl p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.id}
              onClick={() => setKind(k)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                kind.id === k.id ? "bg-gradient-brand text-primary-foreground shadow-glow" : "glass"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder={`Describe your ${kind.label.toLowerCase()}… e.g. "Coffee shop named Brew & Bloom, warm earthy tones"`}
          className="w-full resize-none rounded-xl bg-transparent p-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-3 flex items-center justify-end">
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Design it
          </button>
        </div>
        {error && <p className="mt-3 text-xs text-red-400">Error: {error}</p>}
      </div>

      {image && (
        <div className="glass overflow-hidden rounded-2xl">
          <img src={image} alt="design" className="w-full" />
          <div className="flex justify-end p-3">
            <a
              href={image}
              download={`${kind.id}-design.png`}
              className="inline-flex items-center gap-2 rounded-xl glass px-3 py-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" /> Download PNG
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
