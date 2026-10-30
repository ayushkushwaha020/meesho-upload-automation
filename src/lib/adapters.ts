import { SAMPLE_IMAGES } from "./seed";
import type { ImageItem, Listing, ProductAttributes, UploadAttempt } from "./types";
import { uid } from "./store";

/* ---------------- Image source search ---------------- */

export interface ImageSearchAdapter {
  id: string;
  name: string;
  status: "connected" | "not_configured" | "demo";
  description: string;
  search(attrs: ProductAttributes, reference?: string): Promise<ImageItem[]>;
}

/** Placeholder for a real, licensed visual-search API (e.g. Google Cloud Vision Web Detection, Bing Visual Search). */
export const visualSearchAdapter: ImageSearchAdapter = {
  id: "visual-search-api",
  name: "Visual search API",
  status: "not_configured",
  description:
    "Not connected. Needs an official, licensed search API key configured on the server. No scraping is performed.",
  async search() {
    throw new Error("Visual search API is not configured.");
  },
};

/** Demo adapter: returns bundled sample photos with clearly labelled, fictional sources. */
export const demoSearchAdapter: ImageSearchAdapter = {
  id: "demo",
  name: "Demo sample results",
  status: "demo",
  description: "Bundled sample images with fictional sources so you can try the workflow. Not real search results.",
  async search(_attrs, reference) {
    await new Promise((r) => setTimeout(r, 700));
    const { b1, b2, b3, b4 } = SAMPLE_IMAGES;
    const d = (src: string, source: string, rights: ImageItem["rights"], match: ImageItem["match"], confidence: number): ImageItem => ({
      id: uid(), src, source, rights, match, confidence, demo: true,
    });
    const out: ImageItem[] = [];
    if (reference) out.push(d(reference, "Your reference photo", "seller_owned", "reference", 100));
    out.push(
      d(b1, "Your product shoot (demo sample)", "seller_owned", "verified_exact", 100),
      d(b3, "Your product shoot (demo sample)", "seller_owned", "verified_exact", 100),
      d(b1, "Supplier catalog PDF (demo, authorized)", "manufacturer_authorized", "verified_exact", 96),
      d(b3, "Supplier WhatsApp catalog (demo, authorized)", "manufacturer_authorized", "visually_similar", 81),
      d(b4, "Supplier lifestyle shot (demo, authorized)", "manufacturer_authorized", "visually_similar", 74),
      d(b4, "Public marketplace listing (demo)", "restricted", "visually_similar", 69),
      d(b2, "Unknown web source (demo)", "unverified", "visually_similar", 41),
      d(b1, "Stock photo site (demo)", "unverified", "visually_similar", 58),
    );
    return out;
  },
};

/* ---------------- Attribute inference ---------------- */

const PALETTE: [string, [number, number, number]][] = [
  ["Gold", [196, 152, 72]], ["Silver", [180, 180, 185]], ["Green", [30, 120, 60]], ["Maroon", [110, 25, 35]],
  ["Red", [190, 35, 40]], ["Pink", [220, 120, 160]], ["Blue", [40, 80, 170]], ["Black", [25, 25, 25]],
  ["White", [235, 232, 225]], ["Rose Gold", [200, 140, 120]], ["Multicolor", [140, 110, 90]],
];

/** Real, on-device dominant colour estimate from the photo (centre crop). Not an AI model. */
export async function estimateColor(src: string): Promise<string> {
  return new Promise((resolve) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 48;
      const ctx = c.getContext("2d");
      if (!ctx) return resolve("");
      const s = Math.min(im.width, im.height) * 0.5;
      ctx.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 48, 48);
      const d = ctx.getImageData(0, 0, 48, 48).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const [R, G, B] = [d[i], d[i + 1], d[i + 2]];
        const sat = Math.max(R, G, B) - Math.min(R, G, B);
        if (sat < 25 && R > 200) continue; // skip near-white background
        r += R; g += G; b += B; n++;
      }
      if (!n) return resolve("White");
      const avg = [r / n, g / n, b / n];
      let best = "", bd = Infinity;
      for (const [name, rgb] of PALETTE) {
        const dist = rgb.reduce((acc, v, i) => acc + (v - avg[i]) ** 2, 0);
        if (dist < bd) { bd = dist; best = name; }
      }
      resolve(best);
    };
    im.onerror = () => resolve("");
    im.src = src;
  });
}

/* ---------------- Publishing ---------------- */

export interface PublishResult {
  attempt: UploadAttempt;
}

export interface PublishAdapter {
  id: string;
  name: string;
  connected: boolean;
  publish(listing: Listing, opts?: { simulateFailure?: boolean }): Promise<PublishResult>;
}

/**
 * Official Meesho listing-write integration. Not connected: requires confirmed
 * partner/official API credentials (never a seller password or OTP).
 */
export const meeshoOfficialAdapter: PublishAdapter = {
  id: "meesho-official",
  name: "Meesho official / partner integration",
  connected: false,
  async publish() {
    throw new Error("Integration not connected");
  },
};

/** DEMO only: never contacts Meesho, never produces a "published" status. */
export const demoPublishAdapter: PublishAdapter = {
  id: "demo",
  name: "Demo simulation",
  connected: true,
  async publish(_l, opts) {
    await new Promise((r) => setTimeout(r, 1600));
    if (opts?.simulateFailure) {
      return {
        attempt: {
          id: uid(), at: new Date().toISOString(), mode: "demo", status: "failed",
          message: "DEMO simulated failure",
          detail: "Simulated error: 'size' attribute rejected (example only — no request was sent to Meesho).",
        },
      };
    }
    return {
      attempt: {
        id: uid(), at: new Date().toISOString(), mode: "demo", status: "demo_simulated",
        message: "DEMO simulation completed — nothing was published to Meesho.",
      },
    };
  },
};