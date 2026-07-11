import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/image")({
  component: ImagePage,
});

const styles = [
  "cinematic", "photorealistic", "anime", "3D render", "watercolor",
  "sketch", "cyberpunk", "minimalist", "product shot", "logo mark",
];

function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setImage(null);
    try {
      const full = style ? `${prompt}, ${style} style, ultra detailed, professional` : prompt;
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: full }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setImage(data.image);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image;
    a.download = `nova-${Date.now()}.png`;
    a.click();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">AI Image Generator</h1>
        <p className="mt-2 text-muted-foreground">Describe anything. Get a picture.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="glass rounded-2xl p-6">
          <label className="text-sm font-medium">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            placeholder="A serene temple at golden hour, mist rising, cinematic..."
            className="mt-2 w-full resize-none rounded-xl bg-background/50 p-3 text-sm outline-none ring-1 ring-border focus:ring-brand"
          />

          <label className="mt-5 block text-sm font-medium">Style</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {styles.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(style === s ? "" : s)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  style === s
                    ? "bg-gradient-brand text-primary-foreground shadow-glow"
                    : "glass hover:bg-card"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={generate}
            disabled={!prompt.trim() || loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-glow transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        <div className="glass grid min-h-[400px] place-items-center rounded-2xl p-6">
          {loading && (
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand" />
              <p className="mt-3 text-sm text-muted-foreground">Creating your image...</p>
            </div>
          )}
          {!loading && !image && (
            <div className="text-center text-muted-foreground">
              <Sparkles className="mx-auto h-10 w-10 text-brand" />
              <p className="mt-3 text-sm">Your image will appear here.</p>
            </div>
          )}
          {image && (
            <div className="w-full">
              <img src={image} alt="Generated" className="w-full rounded-xl shadow-elegant" />
              <button
                onClick={download}
                className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
              >
                <Download className="h-4 w-4" /> Download PNG
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
