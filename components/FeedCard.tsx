"use client";

import Link from "next/link";
import { Figure, parseDate, stockLevel } from "@/lib/data";
import FigureImage from "./FigureImage";
import StatusBadge from "./StatusBadge";
import StockBadge from "./StockBadge";
import { Heart } from "./icons";
import { useWishlist } from "@/hooks/useWishlist";

// Full-bleed, image-first feed card (SNKRS "Feed" style) — one per row.
export default function FeedCard({ figure }: { figure: Figure }) {
  const { isWishlisted, toggle, mounted } = useWishlist();
  const active = mounted && isWishlisted(figure.id);
  const level = stockLevel(figure);
  const soldOut = level === "sold_out";
  const coming = figure.status === "coming_soon";

  const statusLine = soldOut
    ? "Sold out"
    : coming
      ? `Dropping ${parseDate(figure.release_date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}`
      : level !== "in_stock"
        ? `Only ${figure.quantity} left`
        : "Available now";

  const statusClass = soldOut
    ? "text-dim"
    : level === "last_items" || level === "low"
      ? "text-accent"
      : "text-ink";

  return (
    <Link href={`/drop/${figure.id}`} className="group block">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-card">
        <FigureImage figure={figure} />
        <div className="absolute left-3 top-3">
          {soldOut ? (
            <StockBadge figure={figure} />
          ) : (
            <StatusBadge status={figure.status} />
          )}
        </div>
        <button
          aria-label="Toggle wishlist"
          onClick={(e) => {
            e.preventDefault();
            toggle(figure.id);
          }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition active:scale-90"
        >
          <Heart
            filled={active}
            className={`h-4 w-4 ${active ? "animate-[pop_.3s_ease]" : ""}`}
          />
        </button>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-dim">
            {figure.series} · {figure.retailer}
          </p>
          <h3 className="mt-1 truncate text-xl font-bold leading-tight text-ink">
            {figure.name}
          </h3>
          <p className={`mt-1 text-sm font-semibold ${statusClass}`}>
            {statusLine}
          </p>
        </div>
        <p className="shrink-0 pb-0.5 text-base font-bold text-ink">
          ¥{figure.price_jpy.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
