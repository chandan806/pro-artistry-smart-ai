import { createFileRoute } from "@tanstack/react-router";
import { Palette, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/design")({
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 md:px-10">
      <div className="glass rounded-3xl p-10 text-center shadow-elegant">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
          <Palette className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">AI Graphic Designer</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">Logos, banners, posters, thumbnails, social media — one prompt, endless designs.</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
          <Sparkles className="h-3 w-3 text-brand" /> Coming in the next release
        </div>
      </div>
    </div>
  ),
});
