import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Briefcase, LayoutDashboard, Sparkles } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs/new", label: "New job", icon: Sparkles },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-surface/70 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <Briefcase className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">Lumen Hire</div>
              <div className="text-[11px] text-muted-foreground -mt-0.5">
                Talent screening intelligence
              </div>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-2 px-3 h-9 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Demo data. Built on Lovable Cloud · AI-powered with Gemini.
      </footer>
    </div>
  );
}
