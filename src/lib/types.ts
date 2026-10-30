export type ListingStatus =
  | "draft"
  | "needs_review"
  | "ready"
  | "upload_pending"
  | "published"
  | "failed";

export type RightsStatus = "seller_owned" | "manufacturer_authorized" | "unverified" | "restricted";
export type MatchLevel = "verified_exact" | "visually_similar" | "reference";

export interface ImageItem {
  id: string;
  src: string;
  source: string;
  rights: RightsStatus;
  match: MatchLevel;
  confidence: number; // 0-100
  demo?: boolean;
}

export interface ProductAttributes {
  category: string;
  subType: string;
  color: string;
  finish: string;
  embellishment: string;
  setCount: string;
}

export interface UploadAttempt {
  id: string;
  at: string;
  mode: "demo" | "live";
  status: "upload_pending" | "demo_simulated" | "published" | "failed";
  message: string;
  detail?: string;
}

export interface Listing {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ListingStatus;
  referencePhoto?: string;
  attributes: ProductAttributes;
  images: ImageItem[];
  fields: Record<string, string>;
  uploads: UploadAttempt[];
  demoSeed?: boolean;
}

export interface Settings {
  manufacturerDetails: string;
  packerDetails: string;
  importerDetails: string;
  defaultHsn: string;
  defaultGst: string;
  skuPrefix: string;
  marginPct: number;
  mrpMarkupPct: number;
  roundTo: number;
  defaultQuantity: string;
  imageTarget: number;
}