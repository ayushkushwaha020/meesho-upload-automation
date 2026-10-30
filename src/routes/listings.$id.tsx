import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Trash2, Replace, CheckCircle2, XCircle, AlertTriangle, Loader2, RotateCcw, Calculator } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { StatusBadge, RightsBadge, MatchBadge, DemoTag } from "@/components/badges";
import { store, uid, useStore } from "@/lib/store";
import { FIELD_DEFS } from "@/lib/categories";
import { applyPricing, derivedStatus, validateListing } from "@/lib/listing-logic";
import { demoPublishAdapter, meeshoOfficialAdapter } from "@/lib/adapters";

export const Route = createFileRoute("/listings/$id")({
  head: () => ({
    meta: [
      { title: "Review listing — MeeshoSnap AI" },
      { name: "description", content: "Review images, details and the validation checklist before upload." },
      { property: "og:title", content: "Review listing — MeeshoSnap AI" },
      { property: "og:description", content: "Review images, details and the validation checklist before upload." },
    ],
  }),
  component: Review,
});

const GROUPS = { basics: "Basics", attributes: "Product attributes", pricing: "Pricing", compliance: "Tax & legal" } as const;

function Review() {
  const { id } = Route.useParams();
  const l = useStore((s) => s.listings.find((x) => x.id === id));
  const settings = useStore((s) => s.settings);
  const [busy, setBusy] = useState(false);
  const [failSim, setFailSim] = useState(false);
  const [preview, setPreview] = useState(0);
  if (!l) return <EmptyState icon={AlertTriangle} title="Listing not found" body="It may have been deleted." action={<Button asChild><Link to="/catalogs">Back to catalogs</Link></Button>} />;

  const checks = validateListing(l, settings.imageTarget);
  const blocking = checks.filter((c) => c.severity === "required" && !c.ok);
  const status = derivedStatus(l, settings.imageTarget);
  const setField = (k: string, v: string) => store.update(id, (x) => ({ ...x, status: ["published", "upload_pending"].includes(x.status) ? x.status : "needs_review", fields: { ...x.fields, [k]: v } }));
  const move = (i: number, d: number) => store.update(id, (x) => { const im = [...x.images]; const j = i + d; if (j < 0 || j >= im.length) return x; [im[i], im[j]] = [im[j], im[i]]; return { ...x, images: im }; });
  const removeImg = (i: number) => store.update(id, (x) => ({ ...x, images: x.images.filter((_, k) => k !== i) }));
  const addFile = (f: File | undefined, replaceAt?: number) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => store.update(id, (x) => {
      const item = { id: uid(), src: r.result as string, source: "Your upload", rights: "seller_owned" as const, match: "verified_exact" as const, confidence: 100 };
      const im = [...x.images];
      if (replaceAt !== undefined) im[replaceAt] = item; else im.push(item);
      return { ...x, images: im };
    });
    r.readAsDataURL(f);
  };
  const pricing = () => {
    const p = applyPricing(Number(l.fields.costPrice), settings);
    if (!p) return toast.error("Enter your cost price first");
    store.update(id, (x) => ({ ...x, fields: { ...x.fields, price: String(p.price), mrp: String(p.mrp) } }));
  };

  async function demoUpload() {
    setBusy(true);
    store.update(id, (x) => ({ ...x, status: "upload_pending" }));
    const { attempt } = await demoPublishAdapter.publish(l!, { simulateFailure: failSim });
    // Demo never yields "published": only a verified live integration response may.
    store.update(id, (x) => ({ ...x, status: attempt.status === "failed" ? "failed" : "ready", uploads: [...x.uploads, attempt] }));
    setBusy(false);
    attempt.status === "failed" ? toast.error(attempt.message) : toast.success(attempt.message);
  }

  const last = l.uploads.at(-1);
  const cur = l.images[preview] ?? l.images[0];

  return (
    <div className="mx-auto max-w-6xl pb-32">
      <PageHeader title={l.fields.title || "Untitled draft"} subtitle={<span className="flex items-center gap-2"><StatusBadge status={status} />{l.demoSeed && <DemoTag />}<span>{l.fields.sku}</span></span>}
        actions={<Button variant="outline" asChild><Link to="/catalogs"><ArrowLeft /> Catalogs</Link></Button>} />

      {last?.status === "failed" && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-danger-soft p-4 text-sm">
          <div><strong className="text-destructive">{last.message}</strong><div className="text-muted-foreground">{last.detail}</div></div>
          <Button variant="outline" size="sm" onClick={demoUpload} disabled={busy}><RotateCcw /> Retry (DEMO)</Button>
        </div>
      )}
      {last?.status === "demo_simulated" && <div className="mb-4 rounded-xl border border-warning/40 bg-warning-soft p-4 text-sm text-warning-foreground"><strong>DEMO:</strong> {last.message}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card-surface p-5">
            <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Images ({l.images.length}/{settings.imageTarget})</h2>
              <Button size="sm" variant="outline" asChild><label className="cursor-pointer">Add image<input type="file" accept="image/*" className="sr-only" onChange={(e) => addFile(e.target.files?.[0])} /></label></Button></div>
            {cur ? <img src={cur.src} alt="Preview" className="mb-3 aspect-[4/3] w-full rounded-xl bg-muted object-contain" /> : <p className="text-sm text-muted-foreground">No images — add at least one.</p>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {l.images.map((im, i) => (
                <div key={im.id} className={`rounded-xl border p-1.5 ${i === preview ? "ring-2 ring-primary" : ""}`}>
                  <button onClick={() => setPreview(i)} className="block w-full"><img src={im.src} alt={`Image ${i + 1}`} className="aspect-square w-full rounded-lg object-cover" /></button>
                  <div className="mt-1 flex flex-wrap gap-1"><RightsBadge rights={im.rights} /><MatchBadge match={im.match} confidence={im.confidence} /></div>
                  <div className="mt-1 flex justify-between">
                    <Button size="icon" variant="ghost" aria-label="Move left" onClick={() => move(i, -1)}><ArrowLeft /></Button>
                    <Button size="icon" variant="ghost" aria-label="Replace" asChild><label className="cursor-pointer"><Replace /><input type="file" accept="image/*" className="sr-only" onChange={(e) => addFile(e.target.files?.[0], i)} /></label></Button>
                    <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => removeImg(i)}><Trash2 /></Button>
                    <Button size="icon" variant="ghost" aria-label="Move right" onClick={() => move(i, 1)}><ArrowRight /></Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((g) => (
            <section key={g} className="card-surface p-5">
              <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-semibold">{GROUPS[g]}</h2>
                {g === "pricing" && <Button size="sm" variant="outline" onClick={pricing}><Calculator /> Apply pricing rule</Button>}</div>
              <div className="grid gap-4 md:grid-cols-2">
                {FIELD_DEFS.filter((f) => f.group === g).map((f) => {
                  const v = l.fields[f.key] ?? "";
                  const P = f.type === "textarea" ? Textarea : Input;
                  return (
                    <label key={f.key} className={`flex flex-col gap-1 text-sm font-medium ${f.type === "textarea" || f.key === "title" ? "md:col-span-2" : ""}`}>
                      <span className="flex items-center justify-between">{f.label}{!v.trim() && <span className="text-xs font-semibold text-warning-foreground">Needs input</span>}</span>
                      <P value={v} type={f.type === "number" ? "number" : undefined} placeholder="Needs input" className={`bg-card ${!v.trim() ? "border-warning" : ""}`}
                        onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => setField(f.key, e.target.value)} />
                      {f.hint && <span className="text-xs font-normal text-muted-foreground">{f.hint}</span>}
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-6">
          <section className="card-surface p-5">
            <h2 className="mb-3 font-display text-lg font-semibold">Validation checklist</h2>
            <ul className="space-y-2 text-sm">
              {checks.map((c) => (
                <li key={c.key} className="flex items-start gap-2">
                  {c.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> : c.severity === "required" ? <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />}
                  <span className={c.ok ? "text-muted-foreground" : ""}>{c.label}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-warning/40 bg-warning-soft p-4 text-xs text-warning-foreground">
            <strong>{meeshoOfficialAdapter.name}: Integration not connected.</strong> Real publishing needs confirmed official/partner credentials or a permitted browser workflow. We never ask for your Meesho password or OTP.
          </section>
          <label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={failSim} onChange={(e) => setFailSim(e.target.checked)} className="accent-primary" /> Simulate a failure in demo run</label>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
          <span className="text-sm">{blocking.length ? <span className="text-destructive">{blocking.length} required item(s) missing</span> : <span className="text-primary">All required checks pass</span>}</span>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={busy || blocking.length > 0} onClick={demoUpload}>{busy ? <Loader2 className="animate-spin" /> : null} Run DEMO simulation</Button>
            <Button size="lg" disabled title="Integration not connected">Approve & Upload to Meesho — Integration not connected</Button>
          </div>
        </div>
      </div>
    </div>
  );
}