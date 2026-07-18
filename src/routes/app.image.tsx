import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Loader2, Download, Upload, Camera, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import AssistantWidget from "@/components/AssistantWidget";

export const Route = createFileRoute("/app/image")({
  component: ImagePage,
});

const STYLES = [
  "cinematic", "photorealistic", "anime", "3D render", "watercolor",
  "sketch", "cyberpunk", "minimalist", "product shot", "logo mark",
  "pixar", "ghibli", "oil painting", "vaporwave",
];
const RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:2"] as const;

function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [ratio, setRatio] = useState<(typeof RATIOS)[number]>("1:1");
  const [refImage, setRefImage] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => stopCamera(), []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (e) {
      toast.error("Camera not available: " + (e as Error).message);
    }
  }

  function snap() {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    setRefImage(canvas.toDataURL("image/png"));
    stopCamera();
  }

  function readFile(f: File) {
    if (!f.type.startsWith("image/")) return toast.error("Please pick an image file");
    const reader = new FileReader();
    reader.onload = () => setRefImage(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setImage(null);
    try {
      const parts = [prompt];
      if (style) parts.push(`${style} style`);
      parts.push(`aspect ratio ${ratio}`, "ultra detailed, professional, high resolution");
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: parts.join(", "), image: refImage ?? undefined }),
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
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-10 md:py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
          <ImageIcon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Image Generator</h1>
          <p className="text-sm text-muted-foreground">Text · upload · camera → picture. Free & unlimited.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="glass rounded-2xl p-5">
          <label className="text-sm font-medium">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="A serene temple at golden hour, mist rising, cinematic..."
            className="mt-2 w-full resize-none rounded-xl bg-background/50 p-3 text-sm outline-none ring-1 ring-border focus:ring-brand"
          />

          {/* Reference image drag/drop/camera */}
          <label className="mt-5 block text-sm font-medium">Reference image <span className="text-xs text-muted-foreground">(optional — edit or transform)</span></label>
          {!refImage ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) readFile(f);
              }}
              className={`mt-2 grid place-items-center rounded-xl border-2 border-dashed p-6 text-center text-xs transition ${
                dragging ? "border-brand bg-brand/10" : "border-border"
              }`}
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Drag & drop, or</p>
              <div className="mt-2 flex gap-2">
                <label className="cursor-pointer rounded-full glass px-3 py-1">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
                </label>
                <button onClick={openCamera} className="inline-flex items-center gap-1 rounded-full glass px-3 py-1">
                  <Camera className="h-3 w-3" /> Camera
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 relative">
              <img src={refImage} alt="reference" className="w-full rounded-xl object-cover" />
              <button onClick={() => setRefImage(null)} className="absolute right-2 top-2 rounded-full bg-background/80 p-1"><X className="h-4 w-4" /></button>
            </div>
          )}

          <label className="mt-5 block text-sm font-medium">Style</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(style === s ? "" : s)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  style === s ? "bg-gradient-brand text-primary-foreground shadow-glow" : "glass hover:bg-card"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <label className="mt-5 block text-sm font-medium">Aspect ratio</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {RATIOS.map((r) => (
              <button
                key={r}
                onClick={() => setRatio(r)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  ratio === r ? "bg-gradient-brand text-primary-foreground shadow-glow" : "glass hover:bg-card"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={generate}
            disabled={!prompt.trim() || loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-glow transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating..." : refImage ? "Transform image" : "Generate"}
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
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
              >
                <Download className="h-4 w-4" /> Download PNG
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Camera modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
          <div className="glass w-full max-w-2xl rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium">Camera</div>
              <button onClick={stopCamera} className="rounded-full glass p-1.5"><X className="h-4 w-4" /></button>
            </div>
            <video ref={videoRef} className="w-full rounded-xl bg-black" playsInline muted />
            <div className="mt-3 flex justify-center gap-2">
              <button onClick={snap} className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2 text-sm font-medium text-primary-foreground shadow-glow">
                <Camera className="h-4 w-4" /> Capture
              </button>
              <button onClick={stopCamera} className="rounded-xl glass px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <AssistantWidget toolName={"AI Image Generator"} capabilities={`• Text-to-image with any style (cinematic, anime, 3D, watercolor, cyberpunk...)
• Aspect ratios 1:1, 16:9, 9:16, 4:3, 3:2
• Transform reference photos (upload, camera, drag-drop)
• Product shots, logos, portraits, landscapes, abstract art
• Download PNG · unlimited free`} />
    </div>
  );
}