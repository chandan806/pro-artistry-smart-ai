import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import AssistantWidget from "@/components/AssistantWidget";

export const Route = createFileRoute("/app/edit")({
  component: EditPage,
});

const presets = [
  { label: "Remove background", prompt: "Remove the background completely, keep the main subject on a transparent/white background." },
  { label: "Enhance & upscale", prompt: "Enhance details, sharpen, denoise and upscale to high resolution while preserving realism." },
  { label: "Anime style", prompt: "Convert this photo into a high-quality anime illustration." },
  { label: "3D render", prompt: "Turn this into a stylized 3D render, Pixar-like." },
  { label: "Watercolor", prompt: "Transform this into a soft watercolor painting." },
  { label: "Cinematic lighting", prompt: "Apply cinematic lighting, dramatic shadows, film color grading." },
  { label: "Studio portrait", prompt: "Restyle as a professional studio portrait with soft key light and neutral background." },
  { label: "Change background to beach", prompt: "Replace the background with a sunny tropical beach at golden hour." },
];

function EditPage() {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Max 8MB image");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(f);
  }

  async function run() {
    if (!image || !prompt.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Edit failed");
      setResult(data.image);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">AI Photo Editor</h1>
        <p className="mt-2 text-muted-foreground">Upload a photo and edit it with a sentence.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="glass rounded-2xl p-6">
          <label className="block text-sm font-medium">Upload photo</label>
          <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-sm text-muted-foreground transition hover:border-brand">
            <Upload className="h-6 w-6" />
            {image ? "Change photo" : "Click to upload"}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>

          <label className="mt-5 block text-sm font-medium">What to change</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Change the shirt to a black tuxedo, keep the face identical."
            className="mt-2 w-full resize-none rounded-xl bg-background/50 p-3 text-sm outline-none ring-1 ring-border focus:ring-brand"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => setPrompt(p.prompt)}
                className="rounded-full px-3 py-1 text-xs glass hover:bg-card"
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={run}
            disabled={!image || !prompt.trim() || loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-glow transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Editing..." : "Apply edit"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass grid min-h-[300px] place-items-center rounded-2xl p-4">
            {image ? (
              <img src={image} alt="Original" className="max-h-[500px] w-auto rounded-xl" />
            ) : (
              <div className="text-center text-muted-foreground">
                <Upload className="mx-auto h-8 w-8" />
                <p className="mt-2 text-sm">Original</p>
              </div>
            )}
          </div>
          <div className="glass grid min-h-[300px] place-items-center rounded-2xl p-4">
            {loading && <Loader2 className="h-8 w-8 animate-spin text-brand" />}
            {!loading && result && (
              <div className="w-full">
                <img src={result} alt="Edited" className="max-h-[500px] w-full rounded-xl object-contain" />
                <button
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = result;
                    a.download = `nova-edit-${Date.now()}.png`;
                    a.click();
                  }}
                  className="mt-3 flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
                >
                  <Download className="h-4 w-4" /> Download
                </button>
              </div>
            )}
            {!loading && !result && (
              <div className="text-center text-muted-foreground">
                <Sparkles className="mx-auto h-8 w-8 text-brand" />
                <p className="mt-2 text-sm">Result will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <AssistantWidget toolName={"AI Photo Editor"} capabilities={`• Natural-language edits ('make it sunset', 'add snow')
• Remove background, upscale, restore old photos
• Face retouch, color grade, add/remove objects
• Style transfer, cartoonify, restore B&W`} />
    </div>
  );
}