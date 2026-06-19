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
  images: string[];
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

// Scraped from hobby-genki.com (pre-order listing + each product's detail page).
// Real from the source: name, price_jpy, retailer, manufacturer, series, scale,
// height, release_date (the product's `available_date`), and all gallery images.
// `preorder_closes` is the one DERIVED field — the shop has no preorder-close
// date, only a release date — so it's set ~6 weeks before release as a stand-in.
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
    preorder_closes: "2026-10-15",
    release_date: "2026-11-30",
    scale: "Non-scale",
    height: "10cm",
    featured: true,
    image_url: "/figures/luka-v4x/01.jpg",
    images: [
      "/figures/luka-v4x/01.jpg",
      "/figures/luka-v4x/02.jpg",
      "/figures/luka-v4x/03.jpg",
      "/figures/luka-v4x/04.jpg",
      "/figures/luka-v4x/05.jpg",
      "/figures/luka-v4x/06.jpg",
      "/figures/luka-v4x/07.jpg",
    ],
  },
  {
    id: "2",
    name: "Cats are Liquid: Silver Moon",
    series: "Cats are Liquid (Karaage Toufu)",
    manufacturer: "WE ART DOING",
    type: "Scale",
    price_jpy: 39990,
    price_usd: 272,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "preorder_open",
    preorder_closes: "2027-02-14",
    release_date: "2027-03-31",
    scale: "Non-scale",
    height: "19.2cm",
    featured: false,
    image_url: "/figures/cats-silver-moon/01.jpg",
    images: [
      "/figures/cats-silver-moon/01.jpg",
      "/figures/cats-silver-moon/02.jpg",
      "/figures/cats-silver-moon/03.jpg",
      "/figures/cats-silver-moon/04.jpg",
      "/figures/cats-silver-moon/05.jpg",
      "/figures/cats-silver-moon/06.jpg",
      "/figures/cats-silver-moon/07.jpg",
      "/figures/cats-silver-moon/08.jpg",
      "/figures/cats-silver-moon/09.jpg",
      "/figures/cats-silver-moon/10.jpg",
      "/figures/cats-silver-moon/11.jpg",
      "/figures/cats-silver-moon/12.jpg",
      "/figures/cats-silver-moon/13.jpg",
    ],
  },
  {
    id: "3",
    name: "Cats are Liquid: Scarlet Night",
    series: "Cats are Liquid (Karaage Toufu)",
    manufacturer: "WE ART DOING",
    type: "Scale",
    price_jpy: 39990,
    price_usd: 272,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "preorder_open",
    preorder_closes: "2027-02-14",
    release_date: "2027-03-31",
    scale: "Non-scale",
    height: "19.2cm",
    featured: false,
    image_url: "/figures/cats-scarlet-night/01.jpg",
    images: [
      "/figures/cats-scarlet-night/01.jpg",
      "/figures/cats-scarlet-night/02.jpg",
      "/figures/cats-scarlet-night/03.jpg",
      "/figures/cats-scarlet-night/04.jpg",
      "/figures/cats-scarlet-night/05.jpg",
      "/figures/cats-scarlet-night/06.jpg",
      "/figures/cats-scarlet-night/07.jpg",
      "/figures/cats-scarlet-night/08.jpg",
      "/figures/cats-scarlet-night/09.jpg",
      "/figures/cats-scarlet-night/10.jpg",
      "/figures/cats-scarlet-night/11.jpg",
      "/figures/cats-scarlet-night/12.jpg",
      "/figures/cats-scarlet-night/13.jpg",
    ],
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
    preorder_closes: "2026-09-15",
    release_date: "2026-10-31",
    scale: "1/20",
    height: "—",
    featured: false,
    image_url: "/figures/pokemon-scale-world-sinnoh/01.jpg",
    images: [
      "/figures/pokemon-scale-world-sinnoh/01.jpg",
      "/figures/pokemon-scale-world-sinnoh/02.jpg",
      "/figures/pokemon-scale-world-sinnoh/03.jpg",
      "/figures/pokemon-scale-world-sinnoh/04.jpg",
      "/figures/pokemon-scale-world-sinnoh/05.jpg",
      "/figures/pokemon-scale-world-sinnoh/06.jpg",
    ],
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
    preorder_closes: "2026-12-15",
    release_date: "2027-01-31",
    scale: "Non-scale",
    height: "10cm",
    featured: false,
    image_url: "/figures/toshiya-miyata/01.jpg",
    images: [
      "/figures/toshiya-miyata/01.jpg",
      "/figures/toshiya-miyata/02.jpg",
      "/figures/toshiya-miyata/03.jpg",
      "/figures/toshiya-miyata/04.jpg",
      "/figures/toshiya-miyata/05.jpg",
      "/figures/toshiya-miyata/06.jpg",
      "/figures/toshiya-miyata/07.jpg",
      "/figures/toshiya-miyata/08.jpg",
    ],
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
