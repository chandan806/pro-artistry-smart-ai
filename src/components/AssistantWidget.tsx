import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Loader2, X, MessageCircle } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

/**
 * Floating AI assistant for every tool page.
 * Explains capabilities of the current tool, suggests ideas,
 * writes prompts, and answers questions — free & unlimited.
 */
export default function AssistantWidget({
  toolName,
  capabilities,
}: {
  toolName: string;
  capabilities: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open, loading]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `Hi! Main ${toolName} ka AI assistant hoon 🤖✨\n\nYahan aap ye sab bana sakte ho:\n${capabilities}\n\nMujhse pucho:\n• "Best prompt likh do for ___"\n• "Kya kya bana sakte hain yahan?"\n• "Step-by-step batao"\n\nSab kuch free & unlimited 💫`,
        },
      ]);
    }
  }, [open, toolName, capabilities, messages.length]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const system = `You are the built-in AI assistant for the "${toolName}" tool on ArtistrySmartAI. This tool can: ${capabilities}. Help users master this tool — suggest creative ideas, write world-class prompts, explain step-by-step how to use it, and answer any follow-up. Also answer general questions (studies, life, etc.) if asked. Reply in the user's language (English/Hindi/Hinglish). Be warm, concise, and inspiring. Everything is free & unlimited.`;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, messages: next }),
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
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow transition hover:scale-105 md:bottom-6 md:right-6"
          title={`Ask ${toolName} AI Assistant`}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-20 right-4 z-40 flex h-[70vh] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-border/50 bg-background/95 shadow-elegant backdrop-blur-lg md:bottom-6 md:right-6">
          <div className="flex items-center justify-between border-b border-border/50 bg-gradient-brand p-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <div className="text-sm font-semibold">{toolName} AI Assistant</div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs ${
                  m.role === "user" ? "bg-gradient-brand text-primary-foreground" : "glass"
                }`}>
                  {m.content || <Loader2 className="h-3 w-3 animate-spin" />}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="border-t border-border/50 p-2">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={`Ask about ${toolName}...`}
                className="max-h-24 flex-1 resize-none rounded-lg bg-card px-2 py-1.5 text-xs outline-none"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-primary-foreground disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
