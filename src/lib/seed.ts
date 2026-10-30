import b1 from "@/assets/bangle-1.jpg";
import b2 from "@/assets/bangle-2.jpg";
import b3 from "@/assets/bangle-3.jpg";
import b4 from "@/assets/bangle-4.jpg";
import type { ImageItem, Listing } from "./types";

export const SAMPLE_IMAGES = { b1, b2, b3, b4 };

const img = (id: string, src: string, p: Partial<ImageItem>): ImageItem => ({
  id, src, source: "Demo sample", rights: "seller_owned", match: "verified_exact", confidence: 100, demo: true, ...p,
});

export function seedListings(): Listing[] {
  const now = Date.now();
  return [
    {
      id: "demo-kundan",
      demoSeed: true,
      createdAt: new Date(now - 86400000 * 2).toISOString(),
      updatedAt: new Date(now - 3600000 * 5).toISOString(),
      status: "needs_review",
      referencePhoto: b3,
      attributes: { category: "bangles", subType: "Bangle set", color: "Gold", finish: "Matte gold-tone", embellishment: "Kundan", setCount: "4" },
      images: [img("s1", b1, { source: "Your photo (demo sample)" }), img("s2", b3, { source: "Your photo (demo sample)" })],
      fields: {
        title: "Women's Gold Matte gold-tone Kundan Bangle set – Set of 4",
        description: "Gold bangle set with kundan detailing in a matte gold-tone finish. Pack contains 4 pieces. Suitable for festive, wedding and everyday ethnic wear.",
        category: "Women Jewellery › Bangles & Bracelets",
        keywords: "bangles for women, kundan bangles, ethnic jewellery",
        sku: "MS-BAN-0001", color: "Gold", material: "", style: "Traditional / Ethnic", quantity: "4", size: "",
        weight: "", costPrice: "180", price: "289", mrp: "529", gst: "3", hsn: "7117", manufacturer: "", packer: "", importer: "",
      },
      uploads: [],
    },
    {
      id: "demo-green",
      demoSeed: true,
      createdAt: new Date(now - 86400000 * 5).toISOString(),
      updatedAt: new Date(now - 86400000).toISOString(),
      status: "failed",
      referencePhoto: b2,
      attributes: { category: "bangles", subType: "Bangle set", color: "Green", finish: "Glossy", embellishment: "", setCount: "12" },
      images: [img("g1", b2, { source: "Your photo (demo sample)" })],
      fields: {
        title: "Women's Green Glossy Glass Bangle set – Set of 12",
        description: "Green glossy bangle set. Pack contains 12 pieces.",
        category: "Women Jewellery › Bangles & Bracelets",
        keywords: "green bangles, glass bangles", sku: "MS-BAN-0002", color: "Green", material: "Glass", style: "Traditional / Ethnic",
        quantity: "12", size: "2.6 inch", weight: "120", costPrice: "90", price: "149", mrp: "269", gst: "3", hsn: "7018",
        manufacturer: "Demo Manufacturer, Firozabad, UP", packer: "Demo Manufacturer, Firozabad, UP", importer: "",
      },
      uploads: [
        {
          id: "u1", at: new Date(now - 86400000).toISOString(), mode: "demo", status: "failed",
          message: "DEMO simulated failure",
          detail: "Simulated error: image resolution below 1000×1000 (example only — no request was sent to Meesho).",
        },
      ],
    },
  ];
}