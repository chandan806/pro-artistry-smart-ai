import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, Wand2, ImageIcon, Video, Palette, MessageSquare, PenLine,
  ArrowRight, Zap, Shield, Globe, Layers,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nova — The world's most advanced AI creative platform" },
      { name: "description", content: "Chat, generate images and videos, edit photos, design logos, write content — all free and unlimited with one AI platform." },
    ],
  }),
  component: Landing,
});

const tools: { to: "/app/chat" | "/app/image" | "/app/edit" | "/app/video" | "/app/design" | "/app/writer" | "/app/templates"; icon: typeof MessageSquare; name: string; desc: string }[] = [
  { to: "/app/chat", icon: MessageSquare, name: "AI Chat", desc: "Your creative co-pilot" },
  { to: "/app/image", icon: ImageIcon, name: "Image Generator", desc: "Any style, any prompt" },
  { to: "/app/edit", icon: Wand2, name: "Photo Editor", desc: "Edit with words" },
  { to: "/app/video", icon: Video, name: "Video Generator", desc: "Text & image to video" },
  { to: "/app/design", icon: Palette, name: "Graphic Designer", desc: "Logos, banners, posters" },
  { to: "/app/writer", icon: PenLine, name: "AI Writer", desc: "Blog, email, resume & more" },
];

const features = [
  { icon: Zap, title: "Instant", desc: "Streaming AI responses in milliseconds." },
  { icon: Shield, title: "Secure", desc: "Enterprise-grade privacy by default." },
  { icon: Globe, title: "Global", desc: "Optimized for every device, worldwide." },
];


function Landing() {
  return (
    <div className="relative min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold">Nova</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#tools" className="hover:text-foreground transition">Tools</a>
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <Link to="/app" className="hover:text-foreground transition">Studio</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="hidden rounded-xl px-3 py-2 text-sm text-muted-foreground hover:text-foreground sm:inline-flex">
              Sign in
            </Link>
            <Link
              to="/app"
              className="rounded-xl bg-gradient-brand px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition hover:opacity-90"
            >
              Open studio
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-noise opacity-30" />
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 md:px-8 md:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
              Powered by the latest AI models
            </div>
            <h1 className="text-5xl font-bold leading-[1.05] md:text-7xl">
              Create <span className="text-gradient">anything</span> with a sentence.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Images, videos, designs, content — all from natural language. One platform. Every creative tool. Made for beginners, loved by pros.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/app"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
              >
                Start creating free
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a href="#tools" className="glass rounded-xl px-6 py-3.5 text-base font-medium transition hover:bg-card">
                Explore tools
              </a>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">No credit card required · 1 GB free storage</p>
          </div>

          {/* Preview card */}
          <div className="glass mt-16 rounded-3xl p-4 shadow-elegant md:p-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {tools.map((t) => (
                <Link key={t.name} to={t.to} className="glass rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-glow">
                  <t.icon className="h-6 w-6 text-brand" />
                  <div className="mt-3 text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold md:text-5xl">Every creative tool. <span className="text-gradient">One canvas.</span></h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">From logos to cinematic videos — describe it, we generate it.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["AI Chat Assistant", "/app/chat"],
            ["AI Image Generator", "/app/image"],
            ["AI Video Generator", "/app/video"],
            ["AI Photo Editor", "/app/edit"],
            ["Background Remover", "/app/edit"],
            ["AI Upscaler", "/app/edit"],
            ["Face Editing", "/app/edit"],
            ["Image to Video", "/app/video"],
            ["Logo Maker", "/app/design"],
            ["Poster & Banner", "/app/design"],
            ["Thumbnail Maker", "/app/design"],
            ["Social Media Design", "/app/design"],
            ["Presentation Maker", "/app/writer"],
            ["Resume Maker", "/app/writer"],
            ["Blog & Email Writer", "/app/writer"],
            ["Content Writer", "/app/writer"],
          ] as const).map(([n, to]) => (
            <Link key={n} to={to} className="glass rounded-2xl p-6 transition hover:-translate-y-0.5 hover:shadow-glow">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="font-semibold">{n}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-8">
              <f.icon className="h-8 w-8 text-brand" />
              <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Free callout */}
      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        <div className="glass rounded-3xl p-10 text-center shadow-elegant">
          <h2 className="text-4xl font-bold md:text-5xl">Every tool. <span className="text-gradient">Free forever.</span></h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">No subscriptions, no credits, no upgrade walls. Sign in and start creating.</p>
          <Link
            to="/app"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
          >
            Open studio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>


      <footer className="border-t border-border/50 py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Nova. Crafted for creators.
      </footer>
    </div>
  );
}
