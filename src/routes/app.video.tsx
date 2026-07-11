import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Video, Loader2, Play, Pause, Download, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/video")({
  component: VideoPage,
});

const STYLES = [
  { id: "cinematic", label: "Cinematic", hint: "cinematic lighting, film grain, shallow depth of field" },
  { id: "anime", label: "Anime", hint: "anime style, vibrant colors, studio ghibli inspired" },
  { id: "3d", label: "3D", hint: "3d render, octane, hyper detailed" },
  { id: "cyberpunk", label: "Cyberpunk", hint: "cyberpunk, neon, rainy street, blade runner" },
  { id: "nature", label: "Nature", hint: "nature documentary, golden hour, ultra realistic" },
];

function VideoPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [frames, setFrames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [idx, setIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % frames.length), 700);
    return () => clearInterval(t);
  }, [playing, frames.length]);

  async function generate() {
    const p = prompt.trim();
    if (!p || loading) return;
    setLoading(true);
    setError(null);
    setFrames([]);
    setProgress(0);
    setIdx(0);

    const shots = [
      "wide establishing shot",
      "medium shot, subject center",
      "close-up detail",
      "dynamic action moment",
      "over-the-shoulder perspective",
      "final dramatic wide shot",
    ];
    const out: string[] = [];
    try {
      for (let i = 0; i < shots.length; i++) {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `${p}. ${shots[i]}. ${style.hint}. Consistent characters, same subject, same style across all frames. Frame ${i + 1} of a short video sequence. 16:9 cinematic composition.`,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { image: string };
        out.push(data.image);
        setFrames([...out]);
        setProgress(Math.round(((i + 1) / shots.length) * 100));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function downloadFrame(url: string, i: number) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `frame-${i + 1}.png`;
    a.click();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-10 md:py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
          <Video className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Video Generator</h1>
          <p className="text-sm text-muted-foreground">Text → 6-frame cinematic sequence, animated preview.</p>
        </div>
      </div>

      <div className="glass mb-6 rounded-2xl p-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. A tiger walking through a misty jungle at dawn, sunlight breaking through trees"
          className="w-full resize-none rounded-xl bg-transparent p-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                style.id === s.id ? "bg-gradient-brand text-primary-foreground shadow-glow" : "glass"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {loading ? `Generating frame ${Math.ceil((progress / 100) * 6)} of 6…` : "6 frames · animated preview"}
          </div>
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate video
          </button>
        </div>
        {loading && (
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-brand transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
        {error && <p className="mt-3 text-xs text-red-400">Error: {error}</p>}
      </div>

      {frames.length > 0 && (
        <>
          <div className="glass relative mb-4 aspect-video overflow-hidden rounded-2xl">
            {frames.map((f, i) => (
              <img
                key={i}
                src={f}
                alt={`frame ${i + 1}`}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
                style={{ opacity: i === idx ? 1 : 0 }}
              />
            ))}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs"
              >
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {playing ? "Pause" : "Play"}
              </button>
              <div className="rounded-full glass px-3 py-1.5 text-xs">
                Frame {idx + 1} / {frames.length}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {frames.map((f, i) => (
              <button
                key={i}
                onClick={() => { setIdx(i); setPlaying(false); }}
                onDoubleClick={() => downloadFrame(f, i)}
                className={`glass overflow-hidden rounded-xl transition ${i === idx ? "ring-2 ring-brand" : ""}`}
                title="Click to view · Double-click to download"
              >
                <img src={f} alt="" className="aspect-video w-full object-cover" />
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            <Download className="mr-1 inline h-3 w-3" /> Double-click any frame to download
          </p>
        </>
      )}
    </div>
  );
}
