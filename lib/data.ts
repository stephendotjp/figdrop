export type Status = "preorder_open" | "preorder_closing" | "coming_soon";
export type RetailerColor = "blue" | "pink" | "teal" | "purple" | "gold";

export interface Figure {
  id: string;
  name: string;
  series: string;
  manufacturer: string;
  type: string;
  price_jpy: number;
  price_usd: number;
  retailer: string;
  retailer_color: RetailerColor;
  status: Status;
  preorder_closes: string;
  release_date: string;
  scale: string;
  height: string;
  featured: boolean;
  image_url: string;
}

export const RETAILER_COLORS: Record<RetailerColor, string> = {
  blue: "#4DA8FF",
  pink: "#E8629A",
  teal: "#3DE8C8",
  purple: "#9B6FE8",
  gold: "#F0C060",
};

export const TYPES = [
  "All",
  "Scale",
  "Nendoroid",
  "Figma",
  "SH Figuarts",
  "Pop Up Parade",
  "Bunny Ver.",
];

// Scraped from https://hobby-genki.com/en/10-pre-order (pre-order listing).
// Real fields: name, price_jpy, retailer, image_url. The listing page does not
// expose series/manufacturer/scale/height/dates — those are best-effort and
// marked "—" where unknown; dates are placeholders, not from the source.
export const figures: Figure[] = [
  {
    id: "1",
    name: "Megurine Luka V4X Nendoroid (Ltd. Bonus Set)",
    series: "Vocaloid",
    manufacturer: "Good Smile Company",
    type: "Nendoroid",
    price_jpy: 8750,
    price_usd: 60,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "preorder_open",
    preorder_closes: "2026-07-18",
    release_date: "2026-11-01",
    scale: "Non-scale",
    height: "10cm",
    featured: true,
    image_url: "/figures/luka-v4x.jpg",
  },
  {
    id: "2",
    name: "Cats are Liquid: Silver Moon",
    series: "Cats are Liquid (Karaage Toufu)",
    manufacturer: "—",
    type: "Scale",
    price_jpy: 39990,
    price_usd: 272,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "preorder_open",
    preorder_closes: "2026-08-15",
    release_date: "2027-01-01",
    scale: "—",
    height: "—",
    featured: false,
    image_url: "/figures/cats-silver-moon.jpg",
  },
  {
    id: "3",
    name: "Cats are Liquid: Scarlet Night",
    series: "Cats are Liquid (Karaage Toufu)",
    manufacturer: "—",
    type: "Scale",
    price_jpy: 39990,
    price_usd: 272,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "preorder_open",
    preorder_closes: "2026-08-15",
    release_date: "2027-01-01",
    scale: "—",
    height: "—",
    featured: false,
    image_url: "/figures/cats-scarlet-night.jpg",
  },
  {
    id: "4",
    name: "Pokémon Scale World Sinnoh Region (3 set)",
    series: "Pokémon",
    manufacturer: "Bandai",
    type: "Scale",
    price_jpy: 4488,
    price_usd: 31,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "preorder_open",
    preorder_closes: "2026-07-25",
    release_date: "2026-10-01",
    scale: "1/20",
    height: "—",
    featured: false,
    image_url: "/figures/pokemon-scale-world-sinnoh.jpg",
  },
  {
    id: "5",
    name: "Toshiya Miyata Nendoroid (Ltd. Edition)",
    series: "Kis-My-Ft2",
    manufacturer: "Good Smile Company",
    type: "Nendoroid",
    price_jpy: 9490,
    price_usd: 65,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "preorder_open",
    preorder_closes: "2026-07-30",
    release_date: "2026-12-01",
    scale: "Non-scale",
    height: "10cm",
    featured: false,
    image_url: "/figures/toshiya-miyata.jpg",
  },
];

export function getFigure(id: string): Figure | undefined {
  return figures.find((f) => f.id === id);
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
