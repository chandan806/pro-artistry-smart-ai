import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PenLine, Loader2, Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import AssistantWidget from "@/components/AssistantWidget";

export const Route = createFileRoute("/app/writer")({
  component: WriterPage,
});

const PRESETS = [
  { id: "blog", label: "Blog post", hint: "Write an engaging blog post with a hook, subheadings, and a clear conclusion." },
  { id: "email", label: "Email", hint: "Write a professional email — concise, polite, and action-oriented." },
  { id: "resume", label: "Resume bullet", hint: "Rewrite the following into strong resume bullets with measurable impact." },
  { id: "social", label: "Social post", hint: "Write a short, punchy social media post with relevant hashtags." },
  { id: "story", label: "Story", hint: "Write a creative short story with vivid detail and a satisfying arc." },
  { id: "slogan", label: "Slogan / tagline", hint: "Generate 8 memorable slogans/taglines." },
  { id: "name", label: "Business name", hint: "Suggest 10 creative business/brand names with brief rationale." },
  { id: "copy", label: "Ad copy", hint: "Write conversion-focused ad copy with a strong CTA." },
  { id: "translate", label: "Translate", hint: "Detect the source language and translate faithfully. Preserve tone." },
  { id: "code", label: "Code", hint: "Write clean, commented code with a short usage example." },
];

function WriterPage() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("Same as input");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setOutput("");
    try {
      const system = `You are an expert AI writer. ${preset.hint} Tone: ${tone}. Output language: ${language}. Use markdown when helpful. Be concise and high quality.`;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", parts: [{ type: "text", text: system }] },
            { role: "user", parts: [{ type: "text", text: topic }] },
          ],
        }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text());
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setOutput(acc);
      }
      if (!acc) setOutput("(no response — try again)");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-10 md:py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
          <PenLine className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Writer</h1>
          <p className="text-sm text-muted-foreground">Blogs · Emails · Resumes · Social · Stories · Translate · Code</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="glass rounded-2xl p-5">
          <label className="text-sm font-medium">What do you want to write?</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  preset.id === p.id ? "bg-gradient-brand text-primary-foreground shadow-glow" : "glass"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <label className="mt-5 block text-sm font-medium">Topic / brief</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={5}
            placeholder="e.g. Benefits of morning walks for remote workers"
            className="mt-2 w-full resize-none rounded-xl bg-background/50 p-3 text-sm outline-none ring-1 ring-border focus:ring-brand"
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Tone</span>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="rounded-lg glass px-2 py-1.5 text-xs">
                {["professional", "casual", "friendly", "witty", "persuasive", "formal", "empathetic"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Language</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-lg glass px-2 py-1.5 text-xs">
                {["Same as input", "English", "Hindi", "Hinglish", "Spanish", "French", "German", "Arabic", "Chinese", "Japanese", "Portuguese", "Russian"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </label>
          </div>

          <button
            onClick={generate}
            disabled={!topic.trim() || loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-glow transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Writing..." : "Generate"}
          </button>
        </div>

        <div className="glass min-h-[400px] rounded-2xl p-6">
          {!output && !loading && (
            <div className="grid h-full place-items-center text-center text-muted-foreground">
              <div>
                <PenLine className="mx-auto h-10 w-10 text-brand" />
                <p className="mt-3 text-sm">Your writing will stream here.</p>
              </div>
            </div>
          )}
          {(output || loading) && (
            <>
              <div className="mb-3 flex justify-end">
                <button onClick={copy} disabled={!output} className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs disabled:opacity-50">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{output}{loading && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-brand align-middle" />}</pre>
            </>
          )}
        </div>
      </div>
      <AssistantWidget toolName={"AI Writer"} capabilities={`• Blog posts, essays, scripts, captions
• Ad copy, product descriptions, emails
• Rewrite, summarize, translate
• Study notes, homework help`} />
    </div>
  );
}