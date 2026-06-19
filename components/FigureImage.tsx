"use client";

import { useState } from "react";
import { Figure, RETAILER_COLORS } from "@/lib/data";

export default function FigureImage({
  figure,
  className = "",
}: {
  figure: Figure;
  className?: string;
}) {
  const [errored, setErrored] = useState(!figure.image_url);
  const hex = RETAILER_COLORS[figure.retailer_color];

  if (!errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={figure.image_url}
        alt={figure.name}
        onError={() => setErrored(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#16161F] to-[#0B0B11] p-4 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(115% 80% at 50% 28%, ${hex}26, transparent 62%)`,
        }}
      />
      <span className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.22em] text-dim">
        {figure.series}
      </span>
      <span className="relative z-10 text-center text-lg font-extrabold leading-tight text-ink drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
        {figure.name}
      </span>
      <span className="relative z-10 text-[10px] tracking-wide text-muted">
        {figure.manufacturer}
      </span>
    </div>
  );
}
