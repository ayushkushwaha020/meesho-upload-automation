import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Library, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { StatusBadge, DemoTag, STATUS_META } from "@/components/badges";
import { store, useStore } from "@/lib/store";
import { derivedStatus } from "@/lib/listing-logic";
import type { ListingStatus } from "@/lib/types";

export const Route = createFileRoute("/catalogs")({
  head: () => ({
    meta: [
      { title: "Catalogs — MeeshoSnap AI" },
      { name: "description", content: "All your Meesho catalog drafts with status and filters." },
      { property: "og:title", content: "Catalogs — MeeshoSnap AI" },
      { property: "og:description", content: "All your Meesho catalog drafts with status and filters." },
    ],
  }),
  component: Catalogs,
});

function Catalogs() {
  const listings = useStore((s) => s.listings);
  const target = useStore((s) => s.settings.imageTarget);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<ListingStatus | "all">("all");
  const rows = listings
    .map((l) => ({ l, st: derivedStatus(l, target) }))
    .filter(({ l, st }) => (filter === "all" || st === filter) && `${l.fields.title} ${l.fields.sku}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Catalogs" subtitle="Every draft is saved on this device." actions={<Button asChild><Link to="/create">Create listing</Link></Button>} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search listings" placeholder="Search title or SKU" value={q} onChange={(e) => setQ(e.target.value)} className="bg-card pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {(["all", ...Object.keys(STATUS_META)] as const).map((k) => (
            <button key={k} onClick={() => setFilter(k as ListingStatus | "all")} aria-pressed={filter === k}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filter === k ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
              {k === "all" ? "All" : STATUS_META[k as ListingStatus].label}
            </button>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={Library} title="Nothing here" body={listings.length ? "No listings match these filters." : "Create a listing from a product photo to get started."}
          action={<Button asChild><Link to="/create">Create listing</Link></Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ l, st }) => (
            <div key={l.id} className="card-surface overflow-hidden">
              <Link to="/listings/$id" params={{ id: l.id }} className="block">
                <div className="relative aspect-[4/3] bg-muted">
                  {(l.images[0]?.src || l.referencePhoto) && <img src={l.images[0]?.src ?? l.referencePhoto} alt="" loading="lazy" className="size-full object-cover" />}
                  <div className="absolute left-3 top-3 flex gap-1.5"><StatusBadge status={st} />{l.demoSeed && <DemoTag />}</div>
                </div>
                <div className="p-4">
                  <div className="line-clamp-2 font-medium">{l.fields.title || "Untitled draft"}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{l.fields.sku || "No SKU"} · {l.images.length} images</div>
                  <div className="mt-2 text-sm font-semibold">{l.fields.price ? `₹${l.fields.price}` : <span className="text-warning-foreground">Price needs input</span>}{l.fields.mrp && <span className="ml-2 text-xs font-normal text-muted-foreground line-through">₹{l.fields.mrp}</span>}</div>
                </div>
              </Link>
              <div className="flex justify-end border-t px-3 py-2">
                <Button variant="ghost" size="sm" aria-label={`Delete ${l.fields.title}`} onClick={() => { if (confirm("Delete this draft?")) { store.remove(l.id); toast.success("Draft deleted"); } }}>
                  <Trash2 /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}