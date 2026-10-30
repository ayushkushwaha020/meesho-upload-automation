import { FIELD_DEFS, getCategory } from "./categories";
import type { Listing, ListingStatus, ProductAttributes, Settings } from "./types";

export function roundUp(value: number, step: number) {
  if (!step || step <= 1) return Math.ceil(value);
  return Math.ceil(value / step) * step;
}

/** Selling price = cost × (1 + margin%), MRP = price × (1 + markup%), both rounded up. */
export function applyPricing(cost: number, s: Pick<Settings, "marginPct" | "mrpMarkupPct" | "roundTo">) {
  if (!cost || cost <= 0) return null;
  const price = roundUp(cost * (1 + s.marginPct / 100), s.roundTo) - (s.roundTo >= 10 ? 1 : 0);
  const mrp = roundUp(price * (1 + s.mrpMarkupPct / 100), s.roundTo) - (s.roundTo >= 10 ? 1 : 0);
  return { price, mrp };
}

export interface CheckItem {
  key: string;
  label: string;
  ok: boolean;
  severity: "required" | "warning";
}

export function validateListing(l: Listing, imageTarget = 8): CheckItem[] {
  const cat = getCategory(l.attributes.category);
  const checks: CheckItem[] = cat.required.map((k) => ({
    key: k,
    label: `${FIELD_DEFS.find((f) => f.key === k)?.label ?? k} filled`,
    ok: !!l.fields[k]?.trim(),
    severity: "required",
  }));
  const price = Number(l.fields.price);
  const mrp = Number(l.fields.mrp);
  if (l.fields.price && l.fields.mrp)
    checks.push({ key: "price_le_mrp", label: "Selling price ≤ MRP", ok: price > 0 && price <= mrp, severity: "required" });
  if (l.fields.hsn)
    checks.push({ key: "hsn_format", label: "HSN is 4–8 digits", ok: /^\d{4,8}$/.test(l.fields.hsn.trim()), severity: "required" });
  if (l.fields.title)
    checks.push({ key: "title_len", label: "Title under 100 characters", ok: l.fields.title.length <= 100, severity: "required" });
  checks.push({ key: "images_min", label: "At least 1 listing image", ok: l.images.length >= 1, severity: "required" });
  checks.push({
    key: "images_rights",
    label: "All images seller-owned or manufacturer-authorized",
    ok: l.images.every((i) => i.rights === "seller_owned" || i.rights === "manufacturer_authorized"),
    severity: "required",
  });
  checks.push({ key: "images_target", label: `${imageTarget - 1}–${imageTarget} images recommended`, ok: l.images.length >= imageTarget - 1, severity: "warning" });
  checks.push({
    key: "exact_match",
    label: "Images verified as exact product (not just similar)",
    ok: l.images.every((i) => i.match !== "visually_similar"),
    severity: "warning",
  });
  return checks;
}

export function derivedStatus(l: Listing, imageTarget = 8): ListingStatus {
  if (["upload_pending", "published", "failed"].includes(l.status)) return l.status;
  const checks = validateListing(l, imageTarget);
  const filled = Object.values(l.fields).filter((v) => v?.trim()).length;
  if (filled === 0) return "draft";
  return checks.some((c) => c.severity === "required" && !c.ok) ? "needs_review" : "ready";
}

/** Template-based draft text. Only uses facts the seller confirmed; unknowns stay empty ("Needs input"). */
export function generateFields(a: ProductAttributes, s: Settings, seq: number): Record<string, string> {
  const cat = getCategory(a.category);
  const parts = [a.color, a.finish, a.embellishment ? `${a.embellishment}` : "", a.subType].filter(Boolean);
  const count = a.setCount ? `Set of ${a.setCount}` : "";
  const title = [`Women's ${parts.join(" ")}`.replace(/\s+/g, " ").trim(), count].filter(Boolean).join(" – ");
  const desc = [
    `${a.color ? a.color + " " : ""}${a.subType.toLowerCase()}${a.embellishment ? ` with ${a.embellishment.toLowerCase()} detailing` : ""}${a.finish ? ` in a ${a.finish.toLowerCase()} finish` : ""}.`,
    count ? `Pack contains ${a.setCount} pieces.` : "",
    "Suitable for festive, wedding and everyday ethnic wear.",
    "Please check the size before ordering.",
  ].filter(Boolean).join(" ");
  const kw = ["bangles for women", a.subType, a.color && `${a.color} bangles`, a.embellishment && `${a.embellishment} bangles`, "ethnic jewellery", "traditional"]
    .filter(Boolean).map((k) => String(k).toLowerCase());
  return {
    title,
    description: desc.charAt(0).toUpperCase() + desc.slice(1),
    category: cat.meeshoPath,
    keywords: Array.from(new Set(kw)).join(", "),
    sku: `${s.skuPrefix}-${a.category.slice(0, 3).toUpperCase()}-${String(seq).padStart(4, "0")}`,
    color: a.color,
    material: "",
    style: a.embellishment ? "Traditional / Ethnic" : "",
    quantity: a.setCount || s.defaultQuantity,
    size: "",
    weight: "",
    costPrice: "",
    price: "",
    mrp: "",
    gst: s.defaultGst,
    hsn: s.defaultHsn,
    manufacturer: s.manufacturerDetails,
    packer: s.packerDetails,
    importer: s.importerDetails,
  };
}