import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, FileClock, CheckCircle2, AlertTriangle, PlusCircle, ArrowRight, PlugZap, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { StatusBadge, DemoTag } from "@/components/badges";
import { useStore } from "@/lib/store";
import { derivedStatus } from "@/lib/listing-logic";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MeeshoSnap AI" },
      { name: "description", content: "Your Meesho listing drafts, review queue and upload status at a glance." },
      { property: "og:title", content: "Dashboard — MeeshoSnap AI" },
      { property: "og:description", content: "Your Meesho listing drafts, review queue and upload status at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const listings = useStore((s) => s.listings);
  const target = useStore((s) => s.settings.imageTarget);
  const withStatus = listings.map((l) => ({ l, st: derivedStatus(l, target) }));
  const count = (f: (s: string) => boolean) => withStatus.filter((x) => f(x.st)).length;
  const stats = [
    { label: "Total drafts", value: listings.length, icon: Library },
    { label: "Needs review", value: count((s) => s === "needs_review" || s === "draft"), icon: FileClock },
    { label: "Ready to upload", value: count((s) => s === "ready"), icon: CheckCircle2 },
    { label: "Failed uploads", value: count((s) => s === "failed"), icon: AlertTriangle },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Good to see you" subtitle="Snap a product, confirm the details, and get a Meesho-ready catalog draft." />

      <section className="hero-surface mb-6 flex flex-col gap-6 overflow-hidden rounded-2xl p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Bangles & jewellery · more categories soon</p>
          <h2 className="mt-2 font-display text-3xl font-semibold leading-tight">From one photo to a review-ready listing</h2>
          <p className="mt-2 text-sm opacity-85">Your photo is used for matching only. You approve every image and fact before anything goes out.</p>
        </div>
        <Button asChild size="lg" variant="secondary" className="h-12 px-6 text-base">
          <Link to="/create"><Camera /> Create listing</Link>
        </Button>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm font-medium">{s.label}</span>
              <s.icon className="size-4" />
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Recent listings</h2>
            <Link to="/catalogs" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          {listings.length === 0 ? (
            <EmptyState icon={PlusCircle} title="No listings yet" body="Create your first listing from a product photo."
              action={<Button asChild><Link to="/create">Create listing</Link></Button>} />
          ) : (
            <ul className="card-surface divide-y">
              {withStatus.slice(0, 5).map(({ l, st }) => (
                <li key={l.id}>
                  <Link to="/listings/$id" params={{ id: l.id }} className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50">
                    <img src={l.images[0]?.src ?? l.referencePhoto} alt="" className="size-14 rounded-lg object-cover bg-muted" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{l.fields.title || "Untitled draft"}</div>
                      <div className="text-xs text-muted-foreground">{l.fields.sku || "No SKU"} · {l.images.length} images · updated {new Date(l.updatedAt).toLocaleDateString()}</div>
                    </div>
                    {l.demoSeed && <DemoTag />}
                    <StatusBadge status={st} />
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Integrations</h2>
          <div className="card-surface space-y-4 p-5 text-sm">
            <IntegrationRow name="Meesho listing upload" state="Integration not connected" />
            <IntegrationRow name="Visual image search" state="Integration not connected" />
            <IntegrationRow name="Demo mode" state="Available" ok />
            <p className="text-xs text-muted-foreground">
              Real publishing needs confirmed official/partner Meesho credentials or a permitted browser workflow. Until then, uploads can only be simulated and are marked DEMO.
            </p>
            <Button asChild variant="outline" size="sm" className="w-full"><Link to="/settings"><PlugZap /> Integration settings</Link></Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function IntegrationRow({ name, state, ok }: { name: string; state: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-medium">{name}</span>
      <span className={ok ? "text-xs font-semibold text-primary" : "text-xs font-semibold text-warning-foreground"}>{state}</span>
    </div>
  );
}