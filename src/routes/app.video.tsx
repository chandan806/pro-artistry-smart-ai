import { createFileRoute } from "@tanstack/react-router";
import { Video, Palette, Layers, Sparkles } from "lucide-react";

function Soon({ icon: Icon, title, blurb }: { icon: typeof Video; title: string; blurb: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 md:px-10">
      <div className="glass rounded-3xl p-10 text-center shadow-elegant">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
          <Icon className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">{blurb}</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
          <Sparkles className="h-3 w-3 text-brand" /> Coming in the next release
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/video")({
  component: () => <Soon icon={Video} title="AI Video Generator" blurb="Text-to-video, image-to-video, talking photos, dance videos, subtitles, voice-over, 4K export." />,
});
