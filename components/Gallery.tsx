"use client";

import { useState } from "react";

export default function Gallery({
  images,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  badge?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const src = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl bg-card">
        <div className="relative aspect-square w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
          />
          {badge && <div className="absolute left-3 top-3">{badge}</div>}
        </div>
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
