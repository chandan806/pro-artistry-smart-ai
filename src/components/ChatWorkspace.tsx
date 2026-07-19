import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Camera,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquarePlus,
  Paperclip,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Attachment = {
  id: string;
  type: "image" | "pdf" | "text" | "file";
  name: string;
  mime: string;
  size: number;
  dataUrl?: string;
  text?: string;
};

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
  createdAt: number;
};

type Thread = { id: string; title: string; updatedAt: number; messages: Msg[] };
type Memory = { id: string; text: string; createdAt: number };
type ChatStore = { threads: Thread[]; memories: Memory[] };

const STORE_KEY = "artistry-smart-ai-chat-v2";
const MAX_FILE_BYTES = 16 * 1024 * 1024;
const MAX_TEXT_CHARS = 18_000;

function id(prefix = "id") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function welcomeMessage(): Msg {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return {
    id: id("msg"),
    role: "assistant",
    createdAt: Date.now(),
    content:
      `Hi! Main Nova hoon — free, fast AI assistant. 🎓✨\n\n📅 Aaj: **${today}**\n\nAap camera photo, image, PDF, text files, paste, drag-drop sab bhej sakte ho. Main padhai, coding, image/PDF analysis, creative prompts, aur ArtistrySmartAI tools mein help karunga.\n\nMemory ke liye bolo: “remember my name is …” / “ye yaad rakhna …” / “forget …”`,
  };
}

function newThread(threadId = id("thread")): Thread {
  const now = Date.now();
  return { id: threadId, title: "New chat", updatedAt: now, messages: [welcomeMessage()] };
}

function readStore(routeThreadId?: string): ChatStore {
  if (typeof window === "undefined") return { threads: [newThread(routeThreadId)], memories: [] };
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || "null") as ChatStore | null;
    const store: ChatStore = parsed?.threads?.length ? parsed : { threads: [], memories: [] };
    if (routeThreadId && !store.threads.some((t) => t.id === routeThreadId)) store.threads.unshift(newThread(routeThreadId));
    if (!store.threads.length) store.threads.unshift(newThread(routeThreadId));
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    return store;
  } catch {
    const store = { threads: [newThread(routeThreadId)], memories: [] };
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    return store;
  }
}

function persist(store: ChatStore) {
  if (typeof window !== "undefined") localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function threadTitle(text: string, attachments: Attachment[]) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean) return clean.slice(0, 42);
  if (attachments.length) return attachments[0].type === "pdf" ? `PDF: ${attachments[0].name}` : `File: ${attachments[0].name}`;
  return "New chat";
}

function memoryChange(text: string): { mode: "add" | "forget"; value: string } | null {
  const lower = text.toLowerCase();
  if (/\b(forget|delete memory|remove memory|don't remember|do not remember)\b/.test(lower) || lower.includes("bhool") || lower.includes("yaad mat")) {
    return { mode: "forget", value: text.replace(/forget|delete memory|remove memory|don't remember|do not remember|bhool jao|yaad mat rakhna/gi, "").trim() };
  }
  const name = text.match(/(?:my name is|mera naam|mera name|naam hai)\s+([\p{L}\p{N} ._-]{2,60})/iu)?.[1]?.trim();
  if (name) return { mode: "add", value: `User's name is ${name.replace(/[.?!]+$/, "")}` };
  const remember = text.match(/(?:remember|yaad rakhna|yaad rakh|save this|note this)[:,\s-]*(.+)$/iu)?.[1]?.trim();
  if (remember) return { mode: "add", value: remember };
  return null;
}

async function fileToAttachment(file: File): Promise<Attachment> {
  if (file.size > MAX_FILE_BYTES) throw new Error(`${file.name} is too large. Max 16MB.`);
  const mime = file.type || "application/octet-stream";
  const base = { id: id("att"), name: file.name, mime, size: file.size };
  if (mime.startsWith("image/")) {
    return { ...base, type: "image", dataUrl: await readAsDataUrl(file) };
  }
  if (mime === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return { ...base, type: "pdf", dataUrl: await readAsDataUrl(file) };
  }
  if (mime.startsWith("text/") || /\.(txt|md|csv|json|html|css|js|ts|tsx|py)$/i.test(file.name)) {
    const text = (await file.text()).slice(0, MAX_TEXT_CHARS);
    return { ...base, type: "text", text };
  }
  return { ...base, type: "file", dataUrl: await readAsDataUrl(file) };
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export default function ChatWorkspace({ routeThreadId }: { routeThreadId?: string }) {
  const navigate = useNavigate();
  const [store, setStore] = useState<ChatStore>(() => readStore(routeThreadId));
  const activeId = routeThreadId ?? store.threads[0]?.id;
  const activeThread = useMemo(
    () => store.threads.find((t) => t.id === activeId) ?? store.threads[0],
    [activeId, store.threads],
  );
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!routeThreadId && activeThread?.id) {
      navigate({ to: "/app/thread/$threadId", params: { threadId: activeThread.id }, replace: true });
    }
  }, [activeThread?.id, navigate, routeThreadId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    textRef.current?.focus();
  }, [activeThread?.messages, loading]);

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length) {
        e.preventDefault();
        void addFiles(files);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  function updateStore(updater: (prev: ChatStore) => ChatStore) {
    setStore((prev) => {
      const next = updater(prev);
      persist(next);
      return next;
    });
  }

  async function addFiles(files: File[]) {
    try {
      const converted = await Promise.all(files.map(fileToAttachment));
      setAttachments((prev) => [...prev, ...converted]);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  function createThread() {
    const thread = newThread();
    updateStore((prev) => ({ ...prev, threads: [thread, ...prev.threads] }));
    navigate({ to: "/app/thread/$threadId", params: { threadId: thread.id } });
  }

  function deleteThread(threadId: string) {
    updateStore((prev) => {
      const remaining = prev.threads.filter((t) => t.id !== threadId);
      return { ...prev, threads: remaining.length ? remaining : [newThread()] };
    });
    if (threadId === activeThread?.id) {
      const next = store.threads.find((t) => t.id !== threadId)?.id ?? id("thread");
      navigate({ to: "/app/thread/$threadId", params: { threadId: next }, replace: true });
    }
  }

  function applyMemoryCommand(text: string) {
    const change = memoryChange(text);
    if (!change) return "";
    if (change.mode === "add" && change.value) {
      updateStore((prev) => ({
        ...prev,
        memories: [{ id: id("mem"), text: change.value, createdAt: Date.now() }, ...prev.memories.filter((m) => m.text !== change.value)].slice(0, 40),
      }));
      return `\n\nMemory saved: ${change.value}`;
    }
    updateStore((prev) => ({
      ...prev,
      memories: change.value
        ? prev.memories.filter((m) => !m.text.toLowerCase().includes(change.value.toLowerCase()))
        : [],
    }));
    return "\n\nMemory updated: removed matching saved memory.";
  }

  async function send() {
    const text = input.trim();
    if ((!text && attachments.length === 0) || loading || !activeThread) return;
    const outgoingAttachments = attachments;
    const userMsg: Msg = {
      id: id("msg"),
      role: "user",
      content: text || "Please analyze these files/images in detail.",
      attachments: outgoingAttachments,
      createdAt: Date.now(),
    };
    const assistantId = id("msg");
    const now = Date.now();
    const suffix = applyMemoryCommand(text);
    const nextMessages = [...activeThread.messages, userMsg];
    updateStore((prev) => ({
      ...prev,
      threads: prev.threads.map((t) =>
        t.id === activeThread.id
          ? { ...t, title: t.title === "New chat" ? threadTitle(text, outgoingAttachments) : t.title, updatedAt: now, messages: nextMessages }
          : t,
      ).sort((a, b) => b.updatedAt - a.updatedAt),
    }));
    setInput("");
    setAttachments([]);
    setLoading(true);
    try {
      const memoryText = store.memories.map((m) => `- ${m.text}`).join("\n");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: memoryText ? `Saved user memory:\n${memoryText}\nUse it naturally. If user asks what you remember, list it.` : undefined,
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments,
          })),
        }),
      });
      if (!res.ok || !res.body) throw new Error((await res.text()) || `HTTP ${res.status}`);
      updateStore((prev) => ({
        ...prev,
        threads: prev.threads.map((t) =>
          t.id === activeThread.id
            ? { ...t, messages: [...t.messages, { id: assistantId, role: "assistant", content: suffix, createdAt: Date.now() }] }
            : t,
        ),
      }));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        updateStore((prev) => ({
          ...prev,
          threads: prev.threads.map((t) =>
            t.id === activeThread.id
              ? { ...t, messages: t.messages.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)) }
              : t,
          ),
        }));
      }
    } catch (e) {
      updateStore((prev) => ({
        ...prev,
        threads: prev.threads.map((t) =>
          t.id === activeThread.id
            ? { ...t, messages: [...t.messages, { id: assistantId, role: "assistant", content: `Error: ${(e as Error).message}`, createdAt: Date.now() }] }
            : t,
        ),
      }));
    } finally {
      setLoading(false);
      textRef.current?.focus();
    }
  }

  if (!activeThread) return null;

  return (
    <div
      className="flex h-[calc(100vh-3.5rem)] md:h-screen"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void addFiles(Array.from(e.dataTransfer.files));
      }}
    >
      <aside className={`${showHistory ? "flex" : "hidden"} w-72 shrink-0 flex-col border-r border-border/50 glass p-3 md:flex`}>
        <button onClick={createThread} className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-3 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
          <MessageSquarePlus className="h-4 w-4" /> New chat
        </button>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {store.threads.map((thread) => (
            <div key={thread.id} className={`group flex items-center gap-1 rounded-xl ${thread.id === activeThread.id ? "bg-card" : "hover:bg-card/70"}`}>
              <button
                onClick={() => navigate({ to: "/app/thread/$threadId", params: { threadId: thread.id } })}
                className="min-w-0 flex-1 truncate px-3 py-2 text-left text-xs"
                title={thread.title}
              >
                {thread.title}
              </button>
              <button onClick={() => deleteThread(thread.id)} className="grid h-8 w-8 place-items-center rounded-lg opacity-60 hover:opacity-100" title="Delete chat">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-border/50 p-3">
          <div className="mb-2 text-xs font-semibold">Memory</div>
          <div className="max-h-32 space-y-1 overflow-y-auto text-[11px] text-muted-foreground">
            {store.memories.length ? store.memories.map((m) => (
              <div key={m.id} className="flex gap-1">
                <span className="flex-1">{m.text}</span>
                <button onClick={() => updateStore((prev) => ({ ...prev, memories: prev.memories.filter((x) => x.id !== m.id) }))} title="Forget">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )) : <p>Say “remember my name is …”</p>}
          </div>
        </div>
      </aside>

      <section className="mx-auto flex min-w-0 flex-1 flex-col px-3 md:px-8">
        <div className="flex items-center justify-between border-b border-border/50 py-4">
          <div>
            <h1 className="text-2xl font-bold">AI Chat</h1>
            <p className="text-sm text-muted-foreground">Tencent HY3 text · free vision fallback · images/PDF/files · saved history</p>
          </div>
          <button onClick={() => setShowHistory((v) => !v)} className="rounded-xl glass px-3 py-2 text-xs md:hidden">History</button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto py-5">
          {activeThread.messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-brand shadow-glow"><Sparkles className="h-4 w-4 text-primary-foreground" /></div>}
              <div className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-gradient-brand text-primary-foreground shadow-glow" : "glass"}`}>
                {m.attachments?.length ? <AttachmentGrid attachments={m.attachments} /> : null}
                <div className="whitespace-pre-wrap leading-relaxed">{m.content || <Loader2 className="h-4 w-4 animate-spin" />}</div>
              </div>
            </div>
          ))}
          {loading && <div className="pl-11 text-xs text-muted-foreground">Nova is answering fast…</div>}
          <div ref={endRef} />
        </div>

        {attachments.length > 0 && <AttachmentPreview attachments={attachments} onRemove={(attId) => setAttachments((prev) => prev.filter((a) => a.id !== attId))} />}

        <div className="glass mb-4 rounded-2xl p-2 md:mb-6">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf,text/*,.txt,.md,.csv,.json,.html,.css,.js,.ts,.tsx,.py"
            multiple
            className="hidden"
            onChange={(e) => { void addFiles(Array.from(e.target.files ?? [])); e.currentTarget.value = ""; }}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => { void addFiles(Array.from(e.target.files ?? [])); e.currentTarget.value = ""; }}
          />
          <div className="flex items-end gap-2">
            <button onClick={() => fileRef.current?.click()} title="Attach image, PDF or file" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-card"><Paperclip className="h-4 w-4" /></button>
            <button onClick={() => cameraRef.current?.click()} title="Camera" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-card"><Camera className="h-4 w-4" /></button>
            <textarea
              ref={textRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
              rows={1}
              placeholder="Ask anything · upload image/PDF/file · camera · paste · remember..."
              className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button onClick={() => void send()} disabled={loading || (!input.trim() && attachments.length === 0)} className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function AttachmentGrid({ attachments }: { attachments: Attachment[] }) {
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {attachments.map((a) => a.type === "image" && a.dataUrl ? (
        <img key={a.id} src={a.dataUrl} alt={a.name} className="h-24 w-24 rounded-lg object-cover" />
      ) : (
        <div key={a.id} className="flex max-w-[220px] items-center gap-2 rounded-lg bg-background/30 px-2 py-1 text-xs">
          {a.type === "pdf" ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          <span className="truncate">{a.name}</span>
        </div>
      ))}
    </div>
  );
}

function AttachmentPreview({ attachments, onRemove }: { attachments: Attachment[]; onRemove: (id: string) => void }) {
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {attachments.map((a) => (
        <div key={a.id} className="relative rounded-lg border border-border/50 bg-card p-1">
          {a.type === "image" && a.dataUrl ? <img src={a.dataUrl} alt={a.name} className="h-16 w-16 rounded-md object-cover" /> : <div className="flex h-16 w-28 items-center gap-1 px-1 text-[10px]"><FileText className="h-4 w-4 shrink-0" /><span className="line-clamp-2">{a.name}</span></div>}
          <button onClick={() => onRemove(a.id)} className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-background shadow"><X className="h-3 w-3" /></button>
        </div>
      ))}
    </div>
  );
}