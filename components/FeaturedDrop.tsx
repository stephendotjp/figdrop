"use client";

import Link from "next/link";
import { Figure, parseDate } from "@/lib/data";
import FigureImage from "./FigureImage";
import RetailerBadge from "./RetailerBadge";

export default function FeaturedDrop({ figure }: { figure: Figure }) {
  const open = figure.status !== "coming_soon";
  const dropLabel = open
    ? "PREORDER OPEN"
    : `DROPPING ${parseDate(figure.release_date)
        .toLocaleDateString("en-US", { month: "short", year: "numeric" })
        .toUpperCase()}`;

  return (
    <Link
      href={`/drop/${figure.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-gold/20 shadow-[0_0_30px_rgba(240,192,96,0.2)]"
    >
      <div className="relative aspect-[4/5] w-full sm:aspect-[16/10]">
        <FigureImage figure={figure} />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
        <div className="pointer-events-none absolute inset-0 animate-[shimmer_7s_linear_infinite] bg-[linear-gradient(110deg,transparent_35%,rgba(240,192,96,0.10)_50%,transparent_65%)] bg-[length:220%_100%]" />

        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[11px] font-bold tracking-wider text-black animate-[softPulse_2.2s_ease-in-out_infinite]">
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
            {dropLabel}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            {figure.series}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold leading-tight">
            {figure.name}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-xl font-bold text-gold">
              ¥{figure.price_jpy.toLocaleString()}
            </span>
            <RetailerBadge
              retailer={figure.retailer}
              color={figure.retailer_color}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
