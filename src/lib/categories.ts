// Category registry. Add new categories here; fields are shared, but each
// category declares which fields are required and its default HSN hint.
export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number";
  group: "basics" | "attributes" | "pricing" | "compliance";
  hint?: string;
}

export const FIELD_DEFS: FieldDef[] = [
  { key: "title", label: "Product title", group: "basics" },
  { key: "description", label: "Description", type: "textarea", group: "basics" },
  { key: "category", label: "Meesho category", group: "basics" },
  { key: "keywords", label: "Search keywords", group: "basics", hint: "Comma separated" },
  { key: "sku", label: "SKU", group: "basics" },
  { key: "color", label: "Color", group: "attributes" },
  { key: "material", label: "Material", group: "attributes", hint: "Only if you know it — don't guess" },
  { key: "style", label: "Style", group: "attributes" },
  { key: "quantity", label: "Pack count / quantity", group: "attributes" },
  { key: "size", label: "Size / dimensions", group: "attributes", hint: "e.g. 2.4 inch inner diameter" },
  { key: "weight", label: "Weight (g)", type: "number", group: "attributes" },
  { key: "costPrice", label: "Your cost price (₹)", type: "number", group: "pricing", hint: "Used by pricing rules; not sent to Meesho" },
  { key: "price", label: "Selling price (₹)", type: "number", group: "pricing" },
  { key: "mrp", label: "MRP (₹)", type: "number", group: "pricing" },
  { key: "gst", label: "GST %", type: "number", group: "compliance" },
  { key: "hsn", label: "HSN code", group: "compliance" },
  { key: "manufacturer", label: "Manufacturer details", type: "textarea", group: "compliance" },
  { key: "packer", label: "Packer details", type: "textarea", group: "compliance" },
  { key: "importer", label: "Importer details", type: "textarea", group: "compliance", hint: "Only if imported" },
];

export interface CategoryDef {
  id: string;
  label: string;
  meeshoPath: string;
  enabled: boolean;
  required: string[];
  subTypes: string[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "bangles",
    label: "Bangles & Bracelets",
    meeshoPath: "Women Jewellery › Bangles & Bracelets",
    enabled: true,
    required: [
      "title", "description", "category", "sku", "color", "style", "quantity", "size",
      "price", "mrp", "gst", "hsn", "manufacturer", "packer",
    ],
    subTypes: ["Bangle set", "Single bangle", "Kada", "Bracelet"],
  },
  { id: "earrings", label: "Earrings", meeshoPath: "Women Jewellery › Earrings", enabled: false, required: [], subTypes: [] },
  { id: "necklaces", label: "Necklaces & Sets", meeshoPath: "Women Jewellery › Necklace Sets", enabled: false, required: [], subTypes: [] },
];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];