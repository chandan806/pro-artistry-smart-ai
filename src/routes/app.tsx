import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Sparkles, MessageSquare, ImageIcon, Wand2, Video, Palette,
  Layers, User, Home, LogOut, LogIn,
} from "lucide-react";
import type { ComponentType } from "react";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Studio — Nova" },
      { name: "description", content: "Your Nova creative studio." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppShell,
});

const nav: { to: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/chat", label: "AI Chat", icon: MessageSquare },
  { to: "/app/image", label: "Image Generator", icon: ImageIcon },
  { to: "/app/edit", label: "Photo Editor", icon: Wand2 },
  { to: "/app/video", label: "Video (soon)", icon: Video },
  { to: "/app/design", label: "Designer (soon)", icon: Palette },
  { to: "/app/templates", label: "Templates (soon)", icon: Layers },
];

function AppShell() {
  const { pathname } = useLocation();
  const { user } = useSession();
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/50 glass p-4 md:flex md:flex-col">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold">Nova</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => {
            const active = pathname === n.to || (n.to !== "/app" && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-gradient-brand text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto glass rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-accent">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Guest</div>
              <div className="text-xs text-muted-foreground">Free plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 glass px-4 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand"><Sparkles className="h-4 w-4 text-primary-foreground" /></div>
          <span className="font-display font-semibold">Nova</span>
        </Link>
      </div>

      <main className="flex-1 md:pt-0 pt-14">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border/50 glass py-2 md:hidden">
        {nav.slice(0, 5).map((n) => {
          const active = pathname === n.to || (n.to !== "/app" && pathname.startsWith(n.to));
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[10px] ${
                active ? "text-brand" : "text-muted-foreground"
              }`}
            >
              <n.icon className="h-5 w-5" />
              {n.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
