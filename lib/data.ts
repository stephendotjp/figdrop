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

const IMG = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

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

export const figures: Figure[] = [
  {
    id: "1",
    name: "Makima: Bunny Ver.",
    series: "Chainsaw Man",
    manufacturer: "Good Smile Company",
    type: "1/4 Scale",
    price_jpy: 44000,
    price_usd: 299,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "preorder_open",
    preorder_closes: "2026-07-15",
    release_date: "2026-12-01",
    scale: "1/4",
    height: "44cm",
    featured: true,
    image_url: IMG("photo-1607604276583-eef5d076aa5f", 1400),
  },
  {
    id: "2",
    name: "Power: Bunny Ver.",
    series: "Chainsaw Man",
    manufacturer: "Good Smile Company",
    type: "1/4 Scale",
    price_jpy: 44000,
    price_usd: 299,
    retailer: "Mecha Japan",
    retailer_color: "pink",
    status: "preorder_open",
    preorder_closes: "2026-07-20",
    release_date: "2026-12-01",
    scale: "1/4",
    height: "44cm",
    featured: false,
    image_url: IMG("photo-1608889175123-8ee362201f81"),
  },
  {
    id: "3",
    name: "Frieren 1/7 Scale",
    series: "Frieren: Beyond Journey's End",
    manufacturer: "Alter",
    type: "1/7 Scale",
    price_jpy: 22800,
    price_usd: 155,
    retailer: "AmiAmi",
    retailer_color: "teal",
    status: "preorder_open",
    preorder_closes: "2026-08-01",
    release_date: "2027-02-01",
    scale: "1/7",
    height: "24cm",
    featured: false,
    image_url: IMG("photo-1612036782180-6f0b6cd846fe"),
  },
  {
    id: "4",
    name: "Anya Forger Nendoroid #2241",
    series: "Spy × Family",
    manufacturer: "Good Smile Company",
    type: "Nendoroid",
    price_jpy: 6600,
    price_usd: 45,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "coming_soon",
    preorder_closes: "2026-09-01",
    release_date: "2027-03-01",
    scale: "Non-scale",
    height: "10cm",
    featured: false,
    image_url: IMG("photo-1626814026160-2237a95fc5a0"),
  },
  {
    id: "5",
    name: "Kitagawa Marin Knit Ver. 1/6",
    series: "My Dress-Up Darling",
    manufacturer: "Good Smile Company",
    type: "1/6 Scale",
    price_jpy: 19800,
    price_usd: 135,
    retailer: "Solaris Japan",
    retailer_color: "purple",
    status: "preorder_open",
    preorder_closes: "2026-07-30",
    release_date: "2026-11-01",
    scale: "1/6",
    height: "28cm",
    featured: false,
    image_url: IMG("photo-1566576912321-d58ddd7a6088"),
  },
  {
    id: "6",
    name: "Gojo Satoru Pop Up Parade L",
    series: "Jujutsu Kaisen",
    manufacturer: "Good Smile Company",
    type: "Pop Up Parade",
    price_jpy: 8800,
    price_usd: 60,
    retailer: "Mecha Japan",
    retailer_color: "pink",
    status: "coming_soon",
    preorder_closes: "2026-09-15",
    release_date: "2027-04-01",
    scale: "Non-scale",
    height: "17cm",
    featured: false,
    image_url: IMG("photo-1531259683007-016a7b628fc3"),
  },
  {
    id: "7",
    name: "Hatsune Miku: Music & Fireworks Ver.",
    series: "Vocaloid",
    manufacturer: "Good Smile Company",
    type: "1/7 Scale",
    price_jpy: 27800,
    price_usd: 189,
    retailer: "Good Smile US",
    retailer_color: "teal",
    status: "preorder_closing",
    preorder_closes: "2026-06-25",
    release_date: "2026-10-01",
    scale: "1/7",
    height: "26cm",
    featured: false,
    image_url: IMG("photo-1542751371-adc38448a05e"),
  },
  {
    id: "8",
    name: "Rem: Crystal Dress Ver. 1/7",
    series: "Re:Zero",
    manufacturer: "Kadokawa",
    type: "1/7 Scale",
    price_jpy: 24800,
    price_usd: 169,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "coming_soon",
    preorder_closes: "2026-10-01",
    release_date: "2027-05-01",
    scale: "1/7",
    height: "25cm",
    featured: false,
    image_url: IMG("photo-1578632767115-351597cf2477"),
  },
  {
    id: "9",
    name: "Zero Two: Pilot Suit Ver. 1/7",
    series: "Darling in the FranXX",
    manufacturer: "Kotobukiya",
    type: "1/7 Scale",
    price_jpy: 21800,
    price_usd: 148,
    retailer: "Solaris Japan",
    retailer_color: "purple",
    status: "preorder_open",
    preorder_closes: "2026-08-15",
    release_date: "2027-01-01",
    scale: "1/7",
    height: "24cm",
    featured: false,
    image_url: IMG("photo-1518562180175-34a163b1a9a6"),
  },
  {
    id: "10",
    name: "Elaina DX Ver. 1/7",
    series: "Wandering Witch: The Journey of Elaina",
    manufacturer: "Good Smile Company",
    type: "1/7 Scale",
    price_jpy: 18700,
    price_usd: 127,
    retailer: "AmiAmi",
    retailer_color: "teal",
    status: "coming_soon",
    preorder_closes: "2026-10-15",
    release_date: "2027-06-01",
    scale: "1/7",
    height: "23cm",
    featured: false,
    image_url: IMG("photo-1613771404721-1f92d799e49f"),
  },
  {
    id: "11",
    name: "Nami: Portrait of Pirates NEO-MAX",
    series: "One Piece",
    manufacturer: "MegaHouse",
    type: "1/8 Scale",
    price_jpy: 19800,
    price_usd: 135,
    retailer: "Mecha Japan",
    retailer_color: "pink",
    status: "preorder_open",
    preorder_closes: "2026-07-10",
    release_date: "2026-11-01",
    scale: "1/8",
    height: "22cm",
    featured: false,
    image_url: IMG("photo-1556438064-2d7646166914"),
  },
  {
    id: "12",
    name: "Asuka Shikinami: Jersey Ver. Nendoroid",
    series: "Rebuild of Evangelion",
    manufacturer: "Good Smile Company",
    type: "Nendoroid",
    price_jpy: 7800,
    price_usd: 53,
    retailer: "Good Smile US",
    retailer_color: "teal",
    status: "coming_soon",
    preorder_closes: "2026-11-01",
    release_date: "2027-07-01",
    scale: "Non-scale",
    height: "10cm",
    featured: false,
    image_url: IMG("photo-1611604548018-d56bbd85d681"),
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
