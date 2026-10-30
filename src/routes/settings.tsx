import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/AppShell";
import { Pill } from "@/components/badges";
import { store, useStore, DEFAULT_SETTINGS } from "@/lib/store";
import { applyPricing } from "@/lib/listing-logic";
import { meeshoOfficialAdapter, visualSearchAdapter } from "@/lib/adapters";
import type { Settings } from "@/lib/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MeeshoSnap AI" },
      { name: "description", content: "Reusable seller details, pricing rules and integration status." },
      { property: "og:title", content: "Settings — MeeshoSnap AI" },
      { property: "og:description", content: "Reusable seller details, pricing rules and integration status." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const saved = useStore((s) => s.settings);
  const [s, setS] = useState<Settings>(saved);
  useEffect(() => setS(saved), [saved]);
  const up = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));
  const example = applyPricing(200, s);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Settings" subtitle="Saved on this device and applied to every new listing."
        actions={<Button onClick={() => { store.saveSettings(s); toast.success("Settings saved"); }}>Save settings</Button>} />

      <div className="space-y-6">
        <section className="card-surface p-6">
          <h2 className="font-display text-xl font-semibold">Seller details</h2>
          <p className="mb-4 text-sm text-muted-foreground">Legal details Meesho requires. Leave blank if you don't know — the listing will show "Needs input".</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Manufacturer name & address"><Textarea value={s.manufacturerDetails} onChange={(e) => up("manufacturerDetails", e.target.value)} /></Field>
            <Field label="Packer name & address"><Textarea value={s.packerDetails} onChange={(e) => up("packerDetails", e.target.value)} /></Field>
            <Field label="Importer details (if imported)"><Textarea value={s.importerDetails} onChange={(e) => up("importerDetails", e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Default HSN"><Input value={s.defaultHsn} onChange={(e) => up("defaultHsn", e.target.value)} /></Field>
              <Field label="Default GST %"><Input value={s.defaultGst} onChange={(e) => up("defaultGst", e.target.value)} /></Field>
              <Field label="SKU prefix"><Input value={s.skuPrefix} onChange={(e) => up("skuPrefix", e.target.value.toUpperCase())} /></Field>
              <Field label="Default pack count"><Input value={s.defaultQuantity} onChange={(e) => up("defaultQuantity", e.target.value)} /></Field>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">HSN/GST defaults are suggestions only — confirm with your tax advisor.</p>
        </section>

        <section className="card-surface p-6">
          <h2 className="font-display text-xl font-semibold">Pricing rules</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <Field label="Margin on cost %"><Input type="number" value={s.marginPct} onChange={(e) => up("marginPct", Number(e.target.value))} /></Field>
            <Field label="MRP above price %"><Input type="number" value={s.mrpMarkupPct} onChange={(e) => up("mrpMarkupPct", Number(e.target.value))} /></Field>
            <Field label="Round to ₹"><Input type="number" value={s.roundTo} onChange={(e) => up("roundTo", Number(e.target.value))} /></Field>
            <Field label="Image target"><Input type="number" min={1} max={10} value={s.imageTarget} onChange={(e) => up("imageTarget", Number(e.target.value))} /></Field>
          </div>
          {example && <p className="mt-3 text-sm text-muted-foreground">Example: cost ₹200 → selling price <strong className="text-foreground">₹{example.price}</strong>, MRP <strong className="text-foreground">₹{example.mrp}</strong></p>}
        </section>

        <section className="card-surface p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><PlugZap className="size-5" /> Integrations</h2>
          <div className="mt-4 divide-y">
            {[meeshoOfficialAdapter, visualSearchAdapter].map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {"description" in a ? a.description : "Requires confirmed official/partner API credentials or a permitted browser workflow. No fake API is used."}
                  </div>
                </div>
                <Pill t="warn">Integration not connected</Pill>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-primary/30 bg-accent p-6 text-sm text-accent-foreground">
          <h2 className="mb-2 flex items-center gap-2 font-semibold"><ShieldCheck className="size-4" /> Security & compliance</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>MeeshoSnap never asks for or stores your Meesho password or OTP.</li>
            <li>No scraping, no CAPTCHA or login bypassing. Image search only via licensed APIs.</li>
            <li>Use seller-owned or manufacturer-authorized images. Others are blocked from upload.</li>
            <li>"Published" is shown only from a verified integration response.</li>
          </ul>
        </section>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => { if (confirm("Reset all drafts to the demo data?")) { store.resetDemo(); toast.success("Demo data restored"); } }}>Reset demo data</Button>
          <Button variant="ghost" onClick={() => setS(DEFAULT_SETTINGS)}>Restore default settings</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <Label className="flex flex-col gap-1.5 text-sm font-medium">{label}{children}</Label>;
}