"use client";

import Link from "next/link";
import { Figure, stockLevel } from "@/lib/data";
import FigureImage from "./FigureImage";
import StatusBadge from "./StatusBadge";
import StockBadge from "./StockBadge";
import { Heart } from "./icons";
import { useWishlist } from "@/hooks/useWishlist";

export default function FigureCard({
  figure,
  variant = "grid",
  cta = false,
}: {
  figure: Figure;
  variant?: "grid" | "row" | "list";
  cta?: boolean;
}) {
  const { isWishlisted, toggle, mounted } = useWishlist();
  const active = mounted && isWishlisted(figure.id);
  const level = stockLevel(figure);
  const soldOut = level === "sold_out";

  const heartBtn = (
    <button
      aria-label="Toggle wishlist"
      onClick={(e) => {
        e.preventDefault();
        toggle(figure.id);
      }}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition active:scale-90"
    >
      <Heart
        filled={active}
        className={`h-4 w-4 ${active ? "animate-[pop_.3s_ease]" : ""}`}
      />
    </button>
  );

  if (variant === "list") {
    return (
      <Link
        href={`/drop/${figure.id}`}
        className="group flex items-center gap-3 py-2"
      >
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-card">
          <FigureImage figure={figure} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-dim">
            {figure.retailer}
          </p>
          <h3 className="truncate text-sm font-semibold text-ink">
            {figure.name}
          </h3>
          <p className="truncate text-[12px] text-dim">{figure.series}</p>
          <p className="mt-0.5 text-sm font-semibold text-ink">
            ¥{figure.price_jpy.toLocaleString()}
          </p>
          {soldOut ? (
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-dim">
              Sold out
            </p>
          ) : (
            level !== "in_stock" && (
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-accent">
                Only {figure.quantity} left
              </p>
            )
          )}
        </div>
        {heartBtn}
      </Link>
    );
  }

  const widthClass = variant === "row" ? "w-44 shrink-0" : "w-full";

  return (
    <Link
      href={`/drop/${figure.id}`}
      className={`group block ${widthClass}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-card">
        <FigureImage figure={figure} />
        <div className="absolute right-2 top-2">{heartBtn}</div>
        <div className="absolute left-2 top-2">
          {!soldOut && <StatusBadge status={figure.status} />}
        </div>
        <div className="absolute bottom-2 left-2">
          <StockBadge figure={figure} />
        </div>
      </div>
      <div className="mt-2.5">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-dim">
          {figure.retailer}
        </p>
        <h3 className="truncate text-sm font-semibold text-ink">
          {figure.name}
        </h3>
        <p className="truncate text-[12px] text-dim">{figure.series}</p>
        <p className="mt-0.5 text-sm font-semibold text-ink">
          ¥{figure.price_jpy.toLocaleString()}
        </p>
        {cta && (
          <span className="mt-3 block rounded-full bg-ink py-2.5 text-center text-xs font-bold text-white transition group-hover:opacity-90">
            Preorder Now
          </span>
        )}
      </div>
    </Link>
  );
}
