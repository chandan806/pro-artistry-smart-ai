import { createFileRoute } from "@tanstack/react-router";
import { Layers, Sparkles } from "lucide-react";

const cats = ["Festival","Temple","Wedding","Birthday","Business","Education","YouTube","Instagram","Facebook","WhatsApp","Marketing","Real Estate","Restaurant","Fashion","Gaming","Travel","Healthcare"];

export const Route = createFileRoute("/app/templates")({
  component: () => (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
          <Layers className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Template Library</h1>
          <p className="text-sm text-muted-foreground">Browse thousands of professionally designed templates.</p>
        </div>
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {cats.map((c) => (
          <span key={c} className="glass rounded-full px-3 py-1 text-xs">{c}</span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="glass aspect-[3/4] rounded-2xl p-4">
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <Sparkles className="h-6 w-6 text-brand" />
              <div className="mt-2 text-xs">Template {i + 1}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
});
