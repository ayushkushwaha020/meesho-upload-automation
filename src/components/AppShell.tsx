import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, PlusCircle, Library, UploadCloud, Settings, ShieldCheck, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/create", label: "Create listing", icon: PlusCircle },
  { to: "/catalogs", label: "Catalogs", icon: Library },
  { to: "/uploads", label: "Upload tracking", icon: UploadCloud },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);
  const active = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {NAV.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            active(n.to)
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          )}
        >
          <n.icon className={cn("size-4", active(n.to) && "text-sidebar-primary")} />
          {n.label}
        </Link>
      ))}
    </nav>
  );

  const brand = (
    <Link to="/" className="flex items-center gap-2.5 px-2">
      <span className="grid size-9 place-items-center rounded-xl bg-sidebar-primary font-display text-lg font-bold text-sidebar-primary-foreground">M</span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold text-sidebar-accent-foreground">MeeshoSnap</span>
        <span className="block text-[11px] uppercase tracking-widest text-sidebar-foreground/60">AI listing studio</span>
      </span>
    </Link>
  );

  const footer = (
    <div className="rounded-xl border border-sidebar-border p-3 text-xs text-sidebar-foreground/75">
      <div className="mb-1 flex items-center gap-1.5 font-semibold text-sidebar-accent-foreground">
        <ShieldCheck className="size-3.5 text-sidebar-primary" /> Security
      </div>
      We never ask for your Meesho password or OTP. No scraping or CAPTCHA bypass.
    </div>
  );

  return (
    <div className="flex min-h-screen w-full">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between bg-sidebar p-4 lg:flex">
        <div className="space-y-8">{brand}{nav}</div>
        {footer}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col justify-between bg-sidebar p-4">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                {brand}
                <button aria-label="Close menu" onClick={() => setOpen(false)} className="text-sidebar-foreground"><X className="size-5" /></button>
              </div>
              {nav}
            </div>
            {footer}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur lg:hidden">
          <button aria-label="Open menu" onClick={() => setOpen(true)}><Menu className="size-5" /></button>
          <span className="font-display text-lg font-semibold">MeeshoSnap AI</span>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card-surface flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-full bg-accent text-accent-foreground"><Icon className="size-5" /></span>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}