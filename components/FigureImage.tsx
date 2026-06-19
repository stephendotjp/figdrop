"use client";

import { useState } from "react";
import { Figure } from "@/lib/data";

export default function FigureImage({
  figure,
  className = "",
}: {
  figure: Figure;
  className?: string;
}) {
  const [errored, setErrored] = useState(!figure.image_url);

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
      className={`flex h-full w-full flex-col justify-between bg-card p-4 ${className}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-dim">
        {figure.series}
      </span>
      <span className="text-center text-lg font-bold uppercase leading-tight text-ink">
        {figure.name}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-dim">
        {figure.manufacturer}
      </span>
    </div>
  );
}
