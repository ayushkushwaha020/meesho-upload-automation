import { cn } from "@/lib/utils";
import type { ListingStatus, MatchLevel, RightsStatus } from "@/lib/types";

const tone = {
  neutral: "bg-muted text-muted-foreground",
  warn: "bg-warning-soft text-warning-foreground",
  ok: "bg-success-soft text-accent-foreground",
  info: "bg-info-soft text-info-foreground",
  bad: "bg-danger-soft text-destructive",
};

export function Pill({ t = "neutral", children, className }: { t?: keyof typeof tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap", tone[t], className)}>
      {children}
    </span>
  );
}

export const STATUS_META: Record<ListingStatus, { label: string; t: keyof typeof tone }> = {
  draft: { label: "Draft", t: "neutral" },
  needs_review: { label: "Needs review", t: "warn" },
  ready: { label: "Ready", t: "ok" },
  upload_pending: { label: "Upload pending", t: "info" },
  published: { label: "Published", t: "ok" },
  failed: { label: "Failed", t: "bad" },
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  const m = STATUS_META[status];
  return <Pill t={m.t}>{m.label}</Pill>;
}

export function RightsBadge({ rights }: { rights: RightsStatus }) {
  const m = {
    seller_owned: { l: "Seller-owned", t: "ok" as const },
    manufacturer_authorized: { l: "Manufacturer-authorized", t: "ok" as const },
    unverified: { l: "Rights unverified", t: "warn" as const },
    restricted: { l: "Not permitted", t: "bad" as const },
  }[rights];
  return <Pill t={m.t}>{m.l}</Pill>;
}

export function MatchBadge({ match, confidence }: { match: MatchLevel; confidence: number }) {
  if (match === "reference") return <Pill t="neutral">Reference photo</Pill>;
  if (match === "verified_exact") return <Pill t="ok">Verified exact · {confidence}%</Pill>;
  return <Pill t="info">Visually similar · {confidence}%</Pill>;
}

export function DemoTag() {
  return <Pill t="warn" className="tracking-wider">DEMO</Pill>;
}