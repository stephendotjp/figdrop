"use client";

import Link from "next/link";
import { getFigure, relatedBySeries, parseDate, stockLevel } from "@/lib/data";
import Gallery from "@/components/Gallery";
import StatusBadge from "@/components/StatusBadge";
import StockBadge from "@/components/StockBadge";
import CountdownTimer from "@/components/CountdownTimer";
import FigureCard from "@/components/FigureCard";
import { useWishlist } from "@/hooks/useWishlist";
import { Heart } from "@/components/icons";

export default function DropDetail({ params }: { params: { id: string } }) {
  const figure = getFigure(params.id);
  const { isWishlisted, toggle, mounted } = useWishlist();

  if (!figure) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-bold">Drop not found</p>
        <Link href="/" className="mt-4 inline-block text-accent">
          ‹ Back home
        </Link>
      </div>
    );
  }

  const active = mounted && isWishlisted(figure.id);
  const related = relatedBySeries(figure.series, figure.id);
  const daysToRelease = Math.ceil(
    (parseDate(figure.release_date).getTime() - Date.now()) / 86400000
  );
  const showCountdown = daysToRelease > 0 && daysToRelease <= 30;
  const level = stockLevel(figure);
  const soldOut = level === "sold_out";

  const specs: [string, string][] = (
    [
      ["Manufacturer", figure.manufacturer],
      ["Type", figure.type],
      ["Scale", figure.scale],
      ["Height", figure.height],
      [
        "Release",
        parseDate(figure.release_date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      ],
    ] as [string, string][]
  ).filter(([, v]) => v && v !== "—");

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-dim transition hover:text-ink"
      >
        ‹ Back
      </Link>

      <Gallery
        images={figure.images}
        alt={figure.name}
        badge={
          soldOut ? (
            <StockBadge figure={figure} />
          ) : (
            <StatusBadge status={figure.status} />
          )
        }
      />

      {showCountdown && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-line p-4">
          <p className="text-[11px] uppercase tracking-widest text-dim">
            Releases in
          </p>
          <CountdownTimer target={figure.release_date + "T00:00:00"} />
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-dim">
          {figure.retailer} · {figure.series}
        </p>
        <h1 className="mt-1 text-3xl font-bold leading-tight tracking-tight text-ink">
          {figure.name}
        </h1>
        <div className="mt-3 flex items-end gap-3">
          <span className="text-2xl font-bold text-ink">
            ¥{figure.price_jpy.toLocaleString()}
          </span>
          <span className="pb-1 text-sm text-dim">
            ≈ ${figure.price_usd} USD
          </span>
        </div>
        {soldOut ? (
          <p className="mt-3 text-sm font-bold uppercase tracking-wide text-dim">
            Sold out at {figure.retailer}
          </p>
        ) : (
          level !== "in_stock" && (
            <p className="mt-3 flex items-center gap-2 text-sm font-bold text-accent">
              <span className="h-2 w-2 rounded-full bg-accent animate-[softPulse_1.4s_ease-in-out_infinite]" />
              Only {figure.quantity} left at {figure.retailer}
            </p>
          )
        )}
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
        {specs.map(([k, v]) => (
          <div key={k} className="bg-white p-4">
            <dt className="text-[10px] uppercase tracking-wider text-dim">
              {k}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-1 gap-3">
        {soldOut ? (
          <span className="cursor-not-allowed rounded-full bg-line py-4 text-center text-sm font-bold tracking-wide text-dim">
            SOLD OUT
          </span>
        ) : (
          <a
            href="#"
            className="rounded-full bg-ink py-4 text-center text-sm font-bold tracking-wide text-white transition hover:opacity-90"
          >
            PREORDER NOW
          </a>
        )}
        <button
          onClick={() => toggle(figure.id)}
          className={`flex items-center justify-center gap-2 rounded-full border py-4 text-sm font-bold transition ${
            active
              ? "border-ink bg-ink text-white"
              : "border-ink text-ink hover:bg-card"
          }`}
        >
          <Heart
            filled={active}
            className={`h-4 w-4 ${active ? "animate-[pop_.3s_ease]" : ""}`}
          />
          {active ? "WISHLISTED" : "ADD TO WISHLIST"}
        </button>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-bold tracking-tight text-ink">
            Also from {figure.series}
          </h2>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {related.map((f) => (
              <FigureCard key={f.id} figure={f} variant="row" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
