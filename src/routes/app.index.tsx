import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, ImageIcon, Wand2, Video, Palette, Layers, PenLine, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: StudioHome,
});

const tools = [
  { to: "/app/chat", icon: MessageSquare, name: "AI Chat", desc: "Ask, brainstorm, translate — any language." },
  { to: "/app/image", icon: ImageIcon, name: "Image Generator", desc: "Prompt, camera or upload to picture." },
  { to: "/app/edit", icon: Wand2, name: "Photo Editor", desc: "Edit with a sentence." },
  { to: "/app/video", icon: Video, name: "Video Generator", desc: "Text · image · audio → MP4." },
  { to: "/app/design", icon: Palette, name: "Graphic Designer", desc: "Logos, posters, banners, thumbnails." },
  { to: "/app/writer", icon: PenLine, name: "AI Writer", desc: "Blog, email, resume, social & more." },
  { to: "/app/templates", icon: Layers, name: "Templates", desc: "Ready-made prompts and starters." },
] as const;

function StudioHome() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold md:text-4xl">Welcome to your studio</h1>
        <p className="mt-2 text-muted-foreground">Every tool is free and unlimited. Pick one to start.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="glass group rounded-2xl p-6 transition hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div className="flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand shadow-glow">
                <t.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
            </div>
            <div className="mt-5 text-lg font-semibold">{t.name}</div>
            <div className="text-sm text-muted-foreground">{t.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
