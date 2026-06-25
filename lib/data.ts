export type Status = "preorder_open" | "preorder_closing" | "coming_soon";
export type RetailerColor = "blue" | "pink" | "teal" | "purple" | "gold";

export interface Figure {
  id: string;
  name: string;
  jan: string; // JAN/EAN barcode (PrestaShop `reference`); "" when none (e.g. art toys)
  series: string;
  manufacturer: string;
  type: string;
  price_jpy: number;
  price_usd: number;
  retailer: string;
  retailer_color: RetailerColor;
  status: Status;
  quantity: number;
  availability: string;
  release_date: string;
  droppedAt: string; // ISO date (YYYY-MM-DD) the figure was added to FigDrop (scrape session)
  scale: string;
  height: string;
  featured: boolean;
  image_url: string;
  images: string[];
}

export const RETAILER_COLORS: Record<RetailerColor, string> = {
  blue: "#4DA8FF",
  pink: "#E8629A",
  teal: "#3DE8C8",
  purple: "#9B6FE8",
  gold: "#F0C060",
};

// Drops-page filter chips, by brand. Manufacturer strings are grouped into
// these via brandGroup() — prefix matching folds brand families (Bandai
// Spirits/MegaHouse → Bandai, Good Smile Arts Shanghai → Good Smile Company).
// Everything else falls into "Other".
export const BRANDS = [
  "All",
  "Medicom Toy",
  "Kaiyodo",
  "Other",
];

export function brandGroup(manufacturer: string): string {
  const m = manufacturer;
  if (m.startsWith("Medicom")) return "Medicom Toy";
  if (m.startsWith("Kaiyodo")) return "Kaiyodo";
  return "Other";
}

// Scraped from hobby-genki.com (pre-order listing + each product's detail page).
// Real from the source: name, price_jpy, retailer, manufacturer, series, scale,
// height, release_date (the product's `available_date`), and all gallery images.
export const figures: Figure[] = [
  {
    id: "94",
    name: "MAFEX No.318 MAFEX WONDER WOMAN (SUPERMAN: FOR TOMORROW) Action Figure",
    jan: "4530956473185",
    series: "DC Comics",
    manufacturer: "Medicom Toy",
    type: "MAFEX",
    price_jpy: 11264,
    price_usd: 77,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "preorder_open",
    quantity: 1431,
    availability: "available",
    release_date: "2027-04-30",
    droppedAt: "2026-06-24",
    scale: "—",
    height: "15cm",
    featured: false,
    image_url: "/figures/mafex-wonder-woman-superman/01.jpg",
    images: [
      "/figures/mafex-wonder-woman-superman/01.jpg",
      "/figures/mafex-wonder-woman-superman/02.jpg",
      "/figures/mafex-wonder-woman-superman/03.jpg",
      "/figures/mafex-wonder-woman-superman/04.jpg",
      "/figures/mafex-wonder-woman-superman/05.jpg",
      "/figures/mafex-wonder-woman-superman/06.jpg",
      "/figures/mafex-wonder-woman-superman/07.jpg",
      "/figures/mafex-wonder-woman-superman/08.jpg",
    ],
  },
  {
    id: "95",
    name: "MAFEX No.317 MAFEX SUPERMAN (SUPERMAN: FOR TOMORROW) Action Figure",
    jan: "4530956473178",
    series: "DC Comics",
    manufacturer: "Medicom Toy",
    type: "MAFEX",
    price_jpy: 11264,
    price_usd: 77,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "preorder_open",
    quantity: 1605,
    availability: "available",
    release_date: "2027-04-30",
    droppedAt: "2026-06-24",
    scale: "—",
    height: "16cm",
    featured: true,
    image_url: "/figures/mafex-superman-superman-for/05.jpg",
    images: [
      "/figures/mafex-superman-superman-for/01.jpg",
      "/figures/mafex-superman-superman-for/02.jpg",
      "/figures/mafex-superman-superman-for/03.jpg",
      "/figures/mafex-superman-superman-for/04.jpg",
      "/figures/mafex-superman-superman-for/05.jpg",
      "/figures/mafex-superman-superman-for/06.jpg",
      "/figures/mafex-superman-superman-for/07.jpg",
      "/figures/mafex-superman-superman-for/08.jpg",
    ],
  },
];

export function getFigure(id: string): Figure | undefined {
  return figures.find((f) => f.id === id);
}

/**
 * URL slug for a figure = its `public/figures/<key>/` folder key (already unique
 * per figure), parsed from the image path. This is the canonical product-URL
 * segment (`/drops/t/<slug>`); `id` stays the internal key (wishlist, redirects).
 */
export function figureSlug(f: Figure): string {
  const src = f.image_url || f.images[0] || "";
  const m = src.match(/\/figures\/([^/]+)\//);
  return m ? m[1] : f.id;
}

export function getFigureBySlug(slug: string): Figure | undefined {
  return figures.find((f) => figureSlug(f) === slug);
}

export function getFeatured(): Figure {
  return figures.find((f) => f.featured) ?? figures[0];
}

export function relatedBySeries(series: string, excludeId: string): Figure[] {
  return figures.filter((f) => f.series === series && f.id !== excludeId);
}

/** Parse a YYYY-MM-DD string as local midnight to avoid timezone day-shifts. */
export function parseDate(s: string): Date {
  return new Date(s + "T00:00:00");
}

export type StockLevel = "sold_out" | "last_items" | "low" | "in_stock";

/** Real stock state from HG's PrestaShop `quantity` / `availability`. */
export function stockLevel(f: Figure): StockLevel {
  if (f.quantity <= 0 || f.availability === "unavailable") return "sold_out";
  if (f.availability === "last_remaining_items" || f.quantity <= 3)
    return "last_items";
  if (f.quantity <= 20) return "low";
  return "in_stock";
}
