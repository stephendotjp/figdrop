"use client";

import Link from "next/link";
import { Figure, parseDate } from "@/lib/data";
import FigureImage from "./FigureImage";
import RetailerBadge from "./RetailerBadge";
import StatusBadge from "./StatusBadge";
import { Heart } from "./icons";
import { useWishlist } from "@/hooks/useWishlist";

function fmtMonth(d: string) {
  return parseDate(d).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

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
  const closing = figure.status === "preorder_closing";

  const heartBtn = (
    <button
      aria-label="Toggle wishlist"
      onClick={(e) => {
        e.preventDefault();
        toggle(figure.id);
      }}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/40 backdrop-blur transition active:scale-90"
    >
      <Heart
        filled={active}
        className={`h-4 w-4 ${active ? "animate-[pop_.3s_ease]" : "text-dim"}`}
      />
    </button>
  );

  if (variant === "list") {
    return (
      <Link
        href={`/drop/${figure.id}`}
        className={`group flex items-center gap-3 rounded-2xl border border-white/5 bg-card p-3 transition hover:border-white/10 ${
          closing ? "closing-glow" : ""
        }`}
      >
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
          <FigureImage figure={figure} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] uppercase tracking-wider text-dim">
            {figure.series}
          </p>
          <h3 className="truncate text-sm font-bold uppercase tracking-tight">
            {figure.name}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-bold text-gold">
              ¥{figure.price_jpy.toLocaleString()}
            </span>
            <RetailerBadge
              retailer={figure.retailer}
              color={figure.retailer_color}
            />
          </div>
          <p className="mt-1 text-[11px] text-muted">
            Releases {fmtMonth(figure.release_date)}
          </p>
        </div>
        {heartBtn}
      </Link>
    );
  }

  const widthClass = variant === "row" ? "w-40 shrink-0" : "w-full";

  return (
    <Link
      href={`/drop/${figure.id}`}
      className={`group relative block ${widthClass} overflow-hidden rounded-2xl border border-white/5 bg-card transition-all duration-200 hover:scale-[1.02] hover:border-white/15 ${
        closing ? "closing-glow" : ""
      }`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <FigureImage figure={figure} />
        <div className="absolute right-2 top-2">{heartBtn}</div>
        <div className="absolute left-2 top-2">
          <StatusBadge status={figure.status} />
        </div>
      </div>
      <div className="p-3">
        <p className="truncate text-[10px] uppercase tracking-wider text-dim">
          {figure.series}
        </p>
        <h3 className="truncate text-sm font-bold">{figure.name}</h3>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-gold">
            ¥{figure.price_jpy.toLocaleString()}
          </span>
          <RetailerBadge
            retailer={figure.retailer}
            color={figure.retailer_color}
          />
        </div>
        {cta && (
          <span className="mt-3 block rounded-xl bg-gold py-2 text-center text-xs font-bold text-black transition group-hover:brightness-110">
            Preorder Now
          </span>
        )}
      </div>
    </Link>
  );
}
