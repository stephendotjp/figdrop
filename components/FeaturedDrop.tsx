"use client";

import Link from "next/link";
import { Figure, parseDate } from "@/lib/data";
import FigureImage from "./FigureImage";
import StatusBadge from "./StatusBadge";

export default function FeaturedDrop({ figure }: { figure: Figure }) {
  const open = figure.status !== "coming_soon";
  const dropLabel = open
    ? "Available now"
    : `Dropping ${parseDate(figure.release_date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })}`;

  return (
    <Link href={`/drop/${figure.id}`} className="group block">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-card">
        <FigureImage figure={figure} />
        <div className="absolute left-3 top-3">
          <StatusBadge status={figure.status} />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-dim">
          Featured · {figure.retailer}
        </p>
        <h2 className="mt-1 text-2xl font-bold leading-tight text-ink">
          {figure.name}
        </h2>
        <p className="mt-1 text-sm text-dim">
          {dropLabel} · ¥{figure.price_jpy.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
