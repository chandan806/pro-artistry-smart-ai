import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, Paperclip, Camera, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/chat")({
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string; images?: string[] };

function ChatPage() {
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        `Hi! I'm Nova — free unlimited AI assistant. 🎓✨\n\n📅 Aaj: **${today}**\n\nMain kar sakta hoon:\n• 📚 Padhai — Math, Science, Coding, JEE/NEET/Board — step-by-step\n• 📸 Image samajhna — camera, upload, drag-drop, paste (Ctrl+V), ya kisi bhi browser se photo bhejo — main detail mein describe karunga, text padhunga, questions ka jawab dunga\n• 🎨 ArtistrySmartAI ke tools guide — image, video, edit, design, writer\n• 🌐 Daily updates, news, translations, casual baat\n\nKya seekhna/dekhna/banana hai?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of items) {
        if (it.type.startsWith("image/")) {
          const f = it.getAsFile();
          if (f) readFile(f);
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  useEffect(() => () => stopCamera(), []);

  function readFile(f: File) {
    if (!f.type.startsWith("image/")) return toast.error("Only image files");
    const reader = new FileReader();
    reader.onload = () => setAttachments((a) => [...a, reader.result as string]);
    reader.readAsDataURL(f);
  }

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
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    setAttachments((a) => [...a, c.toDataURL("image/jpeg", 0.9)]);
    stopCamera();
  }

  async function send() {
    const text = input.trim();
    if ((!text && attachments.length === 0) || loading) return;
    const userMsg: Msg = { role: "user", content: text || (attachments.length ? "What's in this image? Describe in detail." : ""), images: attachments };
    const next: Msg[] = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setAttachments([]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content, images: m.images })),
        }),
      });
      if (!res.ok || !res.body) throw new Error((await res.text()) || `HTTP ${res.status}`);
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + chunk };
          return copy;
        });
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: `Error: ${(e as Error).message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-3xl flex-col px-4 md:h-screen md:px-8"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        Array.from(e.dataTransfer.files).forEach(readFile);
      }}
    >
      <div className="border-b border-border/50 py-5">
        <h1 className="text-2xl font-bold">AI Chat</h1>
        <p className="text-sm text-muted-foreground">Nova · free & unlimited · vision enabled</p>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto py-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-brand shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              m.role === "user" ? "bg-gradient-brand text-primary-foreground shadow-glow" : "glass"
            }`}>
              {m.images && m.images.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {m.images.map((src, j) => (
                    <img key={j} src={src} alt="attachment" className="h-24 w-24 rounded-lg object-cover" />
                  ))}
                </div>
              )}
              <div className="whitespace-pre-wrap">
                {m.content || <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((src, i) => (
            <div key={i} className="relative">
              <img src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <button
                onClick={() => setAttachments((a) => a.filter((_, j) => j !== i))}
                className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-background shadow"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="glass mb-4 rounded-2xl p-2 md:mb-6">
        <div className="flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { Array.from(e.target.files ?? []).forEach(readFile); e.target.value = ""; }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            title="Attach image"
            className="grid h-10 w-10 place-items-center rounded-xl hover:bg-card"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            onClick={openCamera}
            title="Camera"
            className="grid h-10 w-10 place-items-center rounded-xl hover:bg-card"
          >
            <Camera className="h-4 w-4" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            placeholder="Ask anything · paste/drop image · use camera..."
            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={send}
            disabled={loading || (!input.trim() && attachments.length === 0)}
            className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {cameraOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
          <div className="glass w-full max-w-2xl rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium"><ImageIcon className="h-4 w-4" /> Camera</div>
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
    </div>
  );
}
