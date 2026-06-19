"use client";

import Link from "next/link";
import { getFigure, relatedBySeries, parseDate } from "@/lib/data";
import FigureImage from "@/components/FigureImage";
import RetailerBadge from "@/components/RetailerBadge";
import StatusBadge from "@/components/StatusBadge";
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
        <Link href="/" className="mt-4 inline-block text-gold">
          ‹ Back home
        </Link>
      </div>
    );
  }

  const active = mounted && isWishlisted(figure.id);
  const related = relatedBySeries(figure.series, figure.id);
  const daysToClose = Math.ceil(
    (parseDate(figure.preorder_closes).getTime() - Date.now()) / 86400000
  );
  const showCountdown = daysToClose > 0 && daysToClose <= 30;

  const specs: [string, string][] = [
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
    [
      "Preorder closes",
      parseDate(figure.preorder_closes).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    ],
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-dim transition hover:text-ink"
      >
        ‹ Back
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-card">
        <div className="relative aspect-square w-full sm:aspect-[16/10]">
          <FigureImage figure={figure} />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          <div className="absolute left-3 top-3">
            <StatusBadge status={figure.status} />
          </div>
        </div>
      </div>

      {showCountdown && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-pink/30 bg-card p-4 closing-glow">
          <p className="text-[11px] uppercase tracking-widest text-pink">
            Preorder closes in
          </p>
          <CountdownTimer target={figure.preorder_closes + "T23:59:59"} />
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          {figure.series}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight">
          {figure.name}
        </h1>
        <div className="mt-3 flex items-end gap-3">
          <span className="text-3xl font-extrabold text-gold">
            ¥{figure.price_jpy.toLocaleString()}
          </span>
          <span className="pb-1 text-sm text-dim">
            ≈ ${figure.price_usd} USD
          </span>
        </div>
        <div className="mt-3">
          <RetailerBadge
            retailer={figure.retailer}
            color={figure.retailer_color}
          />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5">
        {specs.map(([k, v]) => (
          <div key={k} className="bg-card p-4">
            <dt className="text-[10px] uppercase tracking-wider text-muted">
              {k}
            </dt>
            <dd className="mt-1 text-sm font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-1 gap-3">
        <a
          href="#"
          className="rounded-2xl bg-gold py-4 text-center text-sm font-extrabold tracking-wide text-black transition hover:brightness-110"
        >
          PREORDER NOW
        </a>
        <button
          onClick={() => toggle(figure.id)}
          className={`flex items-center justify-center gap-2 rounded-2xl border py-4 text-sm font-bold transition ${
            active
              ? "border-pink/50 bg-pink/10 text-pink"
              : "border-white/10 text-ink hover:border-white/25"
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
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-dim">
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
