import { createFileRoute, Link } from "@tanstack/react-router";
import { UploadCloud } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { Pill, StatusBadge } from "@/components/badges";
import { useStore } from "@/lib/store";
import { derivedStatus } from "@/lib/listing-logic";

export const Route = createFileRoute("/uploads")({
  head: () => ({
    meta: [
      { title: "Upload tracking — MeeshoSnap AI" },
      { name: "description", content: "Track every upload attempt, demo simulation, failure and retry." },
      { property: "og:title", content: "Upload tracking — MeeshoSnap AI" },
      { property: "og:description", content: "Track every upload attempt, demo simulation, failure and retry." },
    ],
  }),
  component: Uploads,
});

function Uploads() {
  const listings = useStore((s) => s.listings);
  const target = useStore((s) => s.settings.imageTarget);
  const attempts = listings
    .flatMap((l) => l.uploads.map((u) => ({ u, l })))
    .sort((a, b) => b.u.at.localeCompare(a.u.at));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Upload tracking" subtitle="Published appears only after a verified response from a connected Meesho integration. Demo runs never publish anything." />
      <div className="mb-4 rounded-xl border border-warning/40 bg-warning-soft p-4 text-sm text-warning-foreground">
        <strong>Meesho integration not connected.</strong> All attempts below are DEMO simulations.
      </div>
      {attempts.length === 0 ? (
        <EmptyState icon={UploadCloud} title="No upload attempts yet" body="Approve a ready listing on its review screen to see attempts here." />
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-4">Listing</th><th className="p-4">When</th><th className="p-4">Mode</th><th className="p-4">Result</th><th className="p-4">Current status</th></tr>
            </thead>
            <tbody className="divide-y">
              {attempts.map(({ u, l }) => (
                <tr key={u.id} className="align-top">
                  <td className="p-4"><Link to="/listings/$id" params={{ id: l.id }} className="font-medium hover:underline">{l.fields.title || "Untitled"}</Link><div className="text-xs text-muted-foreground">{l.fields.sku}</div></td>
                  <td className="p-4 text-muted-foreground">{new Date(u.at).toLocaleString()}</td>
                  <td className="p-4">{u.mode === "demo" ? <Pill t="warn">DEMO</Pill> : <Pill t="info">Live</Pill>}</td>
                  <td className="p-4">
                    <div className={u.status === "failed" ? "font-medium text-destructive" : "font-medium"}>{u.message}</div>
                    {u.detail && <div className="mt-1 text-xs text-muted-foreground">{u.detail}</div>}
                  </td>
                  <td className="p-4"><StatusBadge status={derivedStatus(l, target)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}