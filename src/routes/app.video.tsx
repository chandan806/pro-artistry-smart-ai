import { createFileRoute } from "@tanstack/react-router";
import AssistantWidget from "@/components/AssistantWidget";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Video, Loader2, Play, Pause, Download, Sparkles, Wand2, Upload, Music, Image as ImageIcon, X,
} from "lucide-react";

export const Route = createFileRoute("/app/video")({
  component: VideoPage,
});

const STYLES = [
  { id: "cinematic", label: "Cinematic", hint: "cinematic lighting, film grain, shallow depth of field, anamorphic lens" },
  { id: "anime", label: "Anime", hint: "anime style, vibrant colors, cel-shaded, studio-quality" },
  { id: "realistic", label: "Realistic", hint: "photorealistic, 8k, ultra detailed, natural lighting" },
  { id: "3d", label: "3D", hint: "3d render, octane, hyper detailed, ray traced" },
  { id: "pixar", label: "Pixar", hint: "pixar style, expressive, soft global illumination, warm colors" },
  { id: "ghibli", label: "Ghibli", hint: "studio ghibli style, hand painted, whimsical, dreamy" },
  { id: "cyberpunk", label: "Cyberpunk", hint: "cyberpunk, neon rain, blade runner, holograms" },
  { id: "cartoon", label: "Cartoon", hint: "flat cartoon style, bold outlines, saturated colors" },
  { id: "fantasy", label: "Fantasy", hint: "epic fantasy, mystical, painterly, dramatic light" },
];

const DURATIONS = [5, 10, 15, 30, 60];
const ASPECTS = [
  { id: "16:9", label: "16:9", w: 1280, h: 720 },
  { id: "9:16", label: "9:16", w: 720, h: 1280 },
  { id: "1:1",  label: "1:1",  w: 1024, h: 1024 },
  { id: "4:5",  label: "4:5",  w: 864,  h: 1080 },
  { id: "21:9", label: "21:9", w: 1680, h: 720 },
];
const RESOLUTIONS = [
  { id: "720p",  label: "720p",  scale: 1 },
  { id: "1080p", label: "1080p", scale: 1.5 },
  { id: "2k",    label: "2K",    scale: 2 },
  { id: "4k",    label: "4K",    scale: 3 },
];
const FPS_OPTIONS = [24, 30, 60];

type Mode = "text" | "image" | "audio";

function VideoPage() {
  const [mode, setMode] = useState<Mode>("text");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [duration, setDuration] = useState(10);
  const [aspect, setAspect] = useState(ASPECTS[0]);
  const [resolution, setResolution] = useState(RESOLUTIONS[1]);
  const [fps, setFps] = useState(30);
  const [frameCount, setFrameCount] = useState(8);

  const [refImage, setRefImage] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [frames, setFrames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);

  const [playing, setPlaying] = useState(true);
  const [idx, setIdx] = useState(0);

  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const frameDurationMs = useMemo(() => Math.max(200, Math.round((duration * 1000) / Math.max(1, frames.length || frameCount))), [duration, frames.length, frameCount]);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % frames.length), frameDurationMs);
    return () => clearInterval(t);
  }, [playing, frames.length, frameDurationMs]);

  async function enhance(kind: "enhance" | "generate") {
    setEnhancing(true);
    setError(null);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode: kind, style: style.label }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { prompt: string };
      if (data.prompt) setPrompt(data.prompt);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnhancing(false);
    }
  }

  function onPickImage(f: File) {
    const reader = new FileReader();
    reader.onload = () => setRefImage(reader.result as string);
    reader.readAsDataURL(f);
  }
  function onPickAudio(f: File) {
    setAudioFile(f);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(URL.createObjectURL(f));
  }

  async function generate() {
    const p = prompt.trim();
    if (!p || loading) return;
    setLoading(true);
    setError(null);
    setFrames([]);
    setProgress(0);
    setIdx(0);

    const shots = buildShots(frameCount);
    const out: string[] = [];
    try {
      for (let i = 0; i < shots.length; i++) {
        setStatusMsg(`Rendering frame ${i + 1} of ${shots.length}…`);
        const fullPrompt = `${p}. ${shots[i]}. ${style.hint}. Consistent characters, same subject, same style across all frames. Frame ${i + 1} of ${shots.length} in a ${duration}s ${aspect.id} video. Cinematic composition.`;
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: fullPrompt,
            image: mode === "image" && i === 0 ? refImage ?? undefined : mode === "image" ? out[i - 1] : undefined,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { image: string };
        out.push(data.image);
        setFrames([...out]);
        setProgress(Math.round(((i + 1) / shots.length) * 100));
      }
      setStatusMsg("Done");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function exportMp4() {
    if (frames.length === 0 || exporting) return;
    setExporting(true);
    setError(null);
    try {
      const outW = Math.round(aspect.w * resolution.scale);
      const outH = Math.round(aspect.h * resolution.scale);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d")!;

      const imgs = await Promise.all(frames.map(loadImage));
      const stream = (canvas as HTMLCanvasElement).captureStream(fps);

      // Optional audio track
      let audioCtx: AudioContext | null = null;
      if (audioFile) {
        audioCtx = new AudioContext();
        const arrayBuf = await audioFile.arrayBuffer();
        const decoded = await audioCtx.decodeAudioData(arrayBuf.slice(0));
        const src = audioCtx.createBufferSource();
        src.buffer = decoded;
        const dest = audioCtx.createMediaStreamDestination();
        src.connect(dest);
        src.connect(audioCtx.destination);
        src.start();
        dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
      }

      const mimeCandidates = [
        "video/mp4;codecs=avc1.42E01E",
        "video/mp4",
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ];
      const mime = mimeCandidates.find((m) => (window as any).MediaRecorder?.isTypeSupported?.(m)) ?? "video/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);

      const done = new Promise<void>((resolve) => { rec.onstop = () => resolve(); });
      rec.start();

      const totalMs = duration * 1000;
      const perFrame = totalMs / frames.length;
      const start = performance.now();

      await new Promise<void>((resolve) => {
        function draw(now: number) {
          const t = now - start;
          if (t >= totalMs) return resolve();
          const i = Math.min(frames.length - 1, Math.floor(t / perFrame));
          const img = imgs[i];
          // cover fit
          const scale = Math.max(outW / img.width, outH / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, outW, outH);
          ctx.drawImage(img, (outW - w) / 2, (outH - h) / 2, w, h);
          requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
      });

      rec.stop();
      await done;
      if (audioCtx) await audioCtx.close();

      const ext = mime.startsWith("video/mp4") ? "mp4" : "webm";
      const blob = new Blob(chunks, { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nova-video-${Date.now()}.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setExporting(false);
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
          <p className="text-sm text-muted-foreground">Text · Image · Audio → MP4 with cinematic styles, up to 4K.</p>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="mb-4 flex gap-2">
        {(["text", "image", "audio"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-xl px-3 py-1.5 text-xs capitalize transition ${
              mode === m ? "bg-gradient-brand text-primary-foreground shadow-glow" : "glass"
            }`}
          >
            {m === "text" ? "Text to Video" : m === "image" ? "Image to Video" : "Audio to Video"}
          </button>
        ))}
      </div>

      <div className="glass mb-6 rounded-2xl p-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="Describe your video… e.g. A neon-lit street in Tokyo, rain falling, hero walks toward camera"
          className="w-full resize-none rounded-xl bg-transparent p-3 text-sm outline-none placeholder:text-muted-foreground"
        />

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => enhance("enhance")}
            disabled={enhancing || !prompt.trim()}
            className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs disabled:opacity-50"
          >
            {enhancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
            Enhance
          </button>
          <button
            onClick={() => enhance("generate")}
            disabled={enhancing}
            className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs disabled:opacity-50"
          >
            {enhancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Generate idea
          </button>

          {mode === "image" && (
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full glass px-3 py-1 text-xs">
              <ImageIcon className="h-3 w-3" />
              {refImage ? "Change image" : "Upload starting image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && onPickImage(e.target.files[0])}
              />
            </label>
          )}
          {mode === "audio" && (
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full glass px-3 py-1 text-xs">
              <Music className="h-3 w-3" />
              {audioFile ? audioFile.name.slice(0, 20) : "Upload audio/song"}
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => e.target.files && onPickAudio(e.target.files[0])}
              />
            </label>
          )}
        </div>

        {refImage && (
          <div className="mt-3 flex items-center gap-2">
            <img src={refImage} alt="reference" className="h-16 w-16 rounded-lg object-cover" />
            <button onClick={() => setRefImage(null)} className="rounded-full glass p-1 text-xs">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} controls className="mt-3 w-full" />
        )}

        {/* Style presets */}
        <div className="mt-4">
          <div className="mb-1 text-xs font-medium text-muted-foreground">Style preset</div>
          <div className="flex flex-wrap gap-2">
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
        </div>

        {/* Settings grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Setting label="Duration">
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-lg glass px-2 py-1.5 text-xs"
            >
              {DURATIONS.map((d) => <option key={d} value={d}>{d}s</option>)}
            </select>
          </Setting>
          <Setting label="Aspect">
            <select
              value={aspect.id}
              onChange={(e) => setAspect(ASPECTS.find((a) => a.id === e.target.value)!)}
              className="w-full rounded-lg glass px-2 py-1.5 text-xs"
            >
              {ASPECTS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </Setting>
          <Setting label="Resolution">
            <select
              value={resolution.id}
              onChange={(e) => setResolution(RESOLUTIONS.find((r) => r.id === e.target.value)!)}
              className="w-full rounded-lg glass px-2 py-1.5 text-xs"
            >
              {RESOLUTIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </Setting>
          <Setting label="FPS">
            <select
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full rounded-lg glass px-2 py-1.5 text-xs"
            >
              {FPS_OPTIONS.map((f) => <option key={f} value={f}>{f} fps</option>)}
            </select>
          </Setting>
          <Setting label={`Keyframes (${frameCount})`}>
            <input
              type="range"
              min={4}
              max={16}
              value={frameCount}
              onChange={(e) => setFrameCount(Number(e.target.value))}
              className="w-full"
            />
          </Setting>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {loading ? statusMsg : `Ready · ${aspect.label} · ${resolution.label} · ${fps}fps · ${duration}s`}
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
          <div className="glass relative mb-4 overflow-hidden rounded-2xl" style={{ aspectRatio: `${aspect.w} / ${aspect.h}` }}>
            {frames.map((f, i) => (
              <img
                key={i}
                src={f}
                alt={`frame ${i + 1}`}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                style={{ opacity: i === idx ? 1 : 0 }}
              />
            ))}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs"
              >
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {playing ? "Pause" : "Play"}
              </button>
              <div className="rounded-full glass px-3 py-1.5 text-xs">Frame {idx + 1} / {frames.length}</div>
              <button
                onClick={exportMp4}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-glow disabled:opacity-50"
              >
                {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Export MP4
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
            {frames.map((f, i) => (
              <button
                key={i}
                onClick={() => { setIdx(i); setPlaying(false); }}
                onDoubleClick={() => downloadFrame(f, i)}
                className={`glass overflow-hidden rounded-lg transition ${i === idx ? "ring-2 ring-brand" : ""}`}
                title="Click to view · Double-click to download frame"
              >
                <img src={f} alt="" className="aspect-video w-full object-cover" />
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            <Upload className="mr-1 inline h-3 w-3" /> Export renders {duration}s at {fps}fps in {aspect.label} · {resolution.label}
          </p>
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
      <AssistantWidget toolName={"AI Video Generator"} capabilities={`• Text-to-video storyboards (6 cinematic frames)
• Image-to-video, audio-to-video
• Aspect 16:9, 9:16, 1:1 · up to 60s · 720p–4K · custom FPS
• MP4/WebM export with audio muxing
• Reels, shorts, ads, cinematic scenes`} />
    </div>
  );
}

function Setting({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function buildShots(n: number): string[] {
  const base = [
    "wide establishing shot",
    "medium shot, subject center",
    "close-up detail",
    "dynamic action moment",
    "over-the-shoulder perspective",
    "low-angle hero shot",
    "tracking shot, subject in motion",
    "high-angle overview",
    "extreme close-up, emotional",
    "profile silhouette shot",
    "wide reveal with foreground element",
    "reaction shot",
    "environment texture detail",
    "cinematic push-in",
    "sweeping crane shot",
    "final dramatic wide shot",
  ];
  return base.slice(0, Math.max(4, Math.min(16, n)));
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
