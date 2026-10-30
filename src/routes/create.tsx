import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Upload, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/AppShell";
import { MatchBadge, RightsBadge, DemoTag, Pill } from "@/components/badges";
import { demoSearchAdapter, estimateColor, visualSearchAdapter } from "@/lib/adapters";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { generateFields } from "@/lib/listing-logic";
import { store, uid, useStore } from "@/lib/store";
import type { ImageItem, ProductAttributes } from "@/lib/types";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create listing — MeeshoSnap AI" },
      { name: "description", content: "Snap a reference photo, match images and generate a listing draft." },
      { property: "og:title", content: "Create listing — MeeshoSnap AI" },
      { property: "og:description", content: "Snap a reference photo, match images and generate a listing draft." },
    ],
  }),
  component: Create,
});

function shrink(file: File): Promise<string> {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const s = Math.min(1, 800 / Math.max(im.width, im.height));
        const c = document.createElement("canvas");
        c.width = im.width * s; c.height = im.height * s;
        c.getContext("2d")!.drawImage(im, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.8));
      };
      im.src = r.result as string;
    };
    r.readAsDataURL(file);
  });
}

function Create() {
  const nav = useNavigate();
  const settings = useStore((s) => s.settings);
  const [photo, setPhoto] = useState<string>();
  const [attrs, setAttrs] = useState<ProductAttributes>({ category: "bangles", subType: "Bangle set", color: "", finish: "", embellishment: "", setCount: "" });
  const [results, setResults] = useState<ImageItem[]>([]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const target = settings.imageTarget;

  async function onFile(f?: File) {
    if (!f) return;
    const d = await shrink(f);
    setPhoto(d);
    const color = await estimateColor(d);
    setAttrs((a) => ({ ...a, color }));
  }

  async function runSearch() {
    setLoading(true);
    const r = await demoSearchAdapter.search(attrs, photo);
    setResults(r);
    setSel(new Set(r.filter((i) => i.rights === "seller_owned" || i.rights === "manufacturer_authorized").filter((i) => i.match !== "reference").slice(0, target).map((i) => i.id)));
    setLoading(false);
  }

  function toggle(i: ImageItem) {
    if (i.rights === "restricted") return;
    setSel((s) => { const n = new Set(s); n.has(i.id) ? n.delete(i.id) : n.add(i.id); return n; });
  }

  function generate() {
    const seq = store.nextSeq();
    const id = uid();
    const now = new Date().toISOString();
    store.upsert({
      id, createdAt: now, updatedAt: now, status: "needs_review", referencePhoto: photo, attributes: attrs,
      images: results.filter((r) => sel.has(r.id)), fields: generateFields(attrs, settings, seq), uploads: [],
    });
    nav({ to: "/listings/$id", params: { id } });
  }

  const set = (k: keyof ProductAttributes, v: string) => setAttrs((a) => ({ ...a, [k]: v }));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Create listing" subtitle="Step 1: reference photo · Step 2: confirm attributes & pick images · Step 3: review" />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <section className="card-surface h-fit p-5">
          <h2 className="font-display text-lg font-semibold">Reference photo</h2>
          <p className="mb-3 mt-1 rounded-lg bg-info-soft p-2 text-xs text-info-foreground">Reference photo — used for matching only; not uploaded as the listing image by default.</p>
          <div className="mb-3 grid aspect-square place-items-center overflow-hidden rounded-xl border-2 border-dashed bg-muted">
            {photo ? <img src={photo} alt="Reference" className="size-full object-cover" /> : <Camera className="size-10 text-muted-foreground" />}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="default"><label className="cursor-pointer"><Camera /> Camera<input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} /></label></Button>
            <Button asChild variant="outline"><label className="cursor-pointer"><Upload /> Upload<input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} /></label></Button>
          </div>

          <h3 className="mb-2 mt-5 text-sm font-semibold">Product attributes</h3>
          <p className="mb-3 text-xs text-muted-foreground">Colour is estimated on-device from your photo. AI vision is not connected — confirm each value.</p>
          <div className="space-y-2.5 text-sm">
            <label className="block">Category
              <select className="mt-1 h-9 w-full rounded-md border bg-card px-2" value={attrs.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id} disabled={!c.enabled}>{c.label}{!c.enabled && " (coming soon)"}</option>)}
              </select>
            </label>
            <label className="block">Type
              <select className="mt-1 h-9 w-full rounded-md border bg-card px-2" value={attrs.subType} onChange={(e) => set("subType", e.target.value)}>
                {getCategory(attrs.category).subTypes.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            {([["color", "Color"], ["finish", "Finish (e.g. Matte, Glossy)"], ["embellishment", "Embellishment (e.g. Kundan)"], ["setCount", "Pieces in set"]] as const).map(([k, l]) => (
              <label key={k} className="block">{l}<Input className="mt-1 bg-card" value={attrs[k]} placeholder="Needs input" onChange={(e) => set(k, e.target.value)} /></label>
            ))}
          </div>
          <Button className="mt-4 w-full" onClick={runSearch} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : null} Find matching images</Button>
        </section>

        <section>
          <div className="card-surface mb-4 space-y-2 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{visualSearchAdapter.name}</span><Pill t="warn">Integration not connected</Pill></div>
            <p className="text-xs text-muted-foreground">{visualSearchAdapter.description}</p>
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{demoSearchAdapter.name}</span><DemoTag /></div>
            <p className="text-xs text-muted-foreground">{demoSearchAdapter.description}</p>
          </div>
          {results.length === 0 ? (
            <div className="card-surface flex flex-col items-center p-12 text-center text-sm text-muted-foreground"><Info className="mb-2 size-6" />Add a photo (optional in demo) and click "Find matching images".</div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between text-sm">
                <span><strong>{sel.size}</strong> / {target} selected</span>
                <Button onClick={generate} disabled={sel.size === 0}>Generate listing draft</Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((i) => (
                  <label key={i.id} className={`card-surface block cursor-pointer overflow-hidden ${sel.has(i.id) ? "ring-2 ring-primary" : ""} ${i.rights === "restricted" ? "cursor-not-allowed opacity-60" : ""}`}>
                    <div className="relative aspect-square bg-muted">
                      <img src={i.src} alt={i.source} loading="lazy" className="size-full object-cover" />
                      <input type="checkbox" className="absolute left-3 top-3 size-5 accent-primary" checked={sel.has(i.id)} disabled={i.rights === "restricted"} onChange={() => toggle(i)} aria-label={`Select ${i.source}`} />
                      {i.demo && <span className="absolute right-3 top-3"><DemoTag /></span>}
                    </div>
                    <div className="space-y-1.5 p-3 text-xs">
                      <div className="font-medium text-sm">{i.source}</div>
                      <div className="flex flex-wrap gap-1"><MatchBadge match={i.match} confidence={i.confidence} /><RightsBadge rights={i.rights} /></div>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}