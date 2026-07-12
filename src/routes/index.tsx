import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, Wand2, ImageIcon, Video, Palette, MessageSquare,
  ArrowRight, Zap, Shield, Globe, Layers, Check,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VIP Smart— The world's most advanced AI creative platform" },
      { name: "description", content: "Chat, generate images and videos, edit photos, design logos, banners, posters, and more — all with one intelligent AI platform." },
    ],
  }),
  component: Landing,
});

const tools = [
  { icon: MessageSquare, name: "AI Chat", desc: "Your creative co-pilot" },
  { icon: ImageIcon, name: "Image Generator", desc: "Any style, any prompt" },
  { icon: Wand2, name: "Photo Editor", desc: "Edit with words" },
  { icon: Video, name: "Video Generator", desc: "Text & image to video" },
  { icon: Palette, name: "Graphic Designer", desc: "Logos, banners, posters" },
  { icon: Layers, name: "Template Library", desc: "1000+ templates" },
];

const features = [
  { icon: Zap, title: "Instant", desc: "Streaming AI responses in milliseconds." },
  { icon: Shield, title: "Secure", desc: "Enterprise-grade privacy by default." },
  { icon: Globe, title: "Global", desc: "Optimized for every device, worldwide." },
];

const plans = [
  { name: "Free", price: "₹0", oldPrice: null as string | null, period: "forever", badge: null as string | null, features: ["Daily generations", "Standard quality", "1 GB storage", "Watermark on some outputs"] },
  { name: "Pro", price: "₹5", oldPrice: "₹69", period: "/month", badge: "Limited offer", features: ["Unlimited generations", "4K quality", "100 GB storage", "No watermark", "Priority queue"], featured: true },
  { name: "Yearly", price: "₹199", oldPrice: "₹799", period: "/year", badge: "Limited offer", features: ["Everything in Pro", "Commercial license", "1 TB storage", "Early access to new models"] },
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
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
            <a href="#features" className="hover:text-foreground transition">Features</a>
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
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {tools.map((t) => (
                <div key={t.name} className="glass rounded-2xl p-4 transition hover:shadow-glow">
                  <t.icon className="h-6 w-6 text-brand" />
                  <div className="mt-3 text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.desc}</div>
                </div>
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
          {[
            "AI Chat Assistant","AI Image Generator","AI Video Generator","AI Photo Editor",
            "Background Remover","AI Upscaler","Face Editing","Image to Video",
            "Logo Maker","Poster & Banner","Thumbnail Maker","Social Media Design",
            "Presentation Maker","Resume Maker","PDF Creator","Content Writer",
          ].map((n) => (
            <div key={n} className="glass rounded-2xl p-6 transition hover:-translate-y-0.5 hover:shadow-glow">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="font-semibold">{n}</div>
              </div>
            </div>
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

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold md:text-5xl">Simple, generous pricing</h2>
          <p className="mt-3 text-muted-foreground">Try Nova for as little as ₹1.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`glass rounded-3xl p-8 transition ${p.featured ? "ring-2 ring-brand shadow-glow" : ""}`}
            >
              {p.featured && (
                <div className="mb-3 inline-flex rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </div>
              )}
              <div className="text-lg font-semibold">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
                {p.oldPrice && (
                  <span className="text-base text-muted-foreground line-through">{p.oldPrice}</span>
                )}
              </div>
              {p.badge && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-1 text-[11px] font-semibold text-destructive">
                  🔥 {p.badge} — high rate <span className="line-through opacity-70">{p.oldPrice}</span>
                </div>
              )}
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/app"
                className={`mt-8 block rounded-xl px-4 py-2.5 text-center text-sm font-medium transition ${
                  p.featured
                    ? "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90"
                    : "glass hover:bg-card"
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Also available: ₹1/hr · ₹2/2hr · ₹2/day · ₹11/week
        </p>
      </section>

      <footer className="border-t border-border/50 py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Nova. Crafted for creators.
      </footer>
    </div>
  );
}
