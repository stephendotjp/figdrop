"use client";

import { useEffect, useRef, useState } from "react";
import { Rotate, ZoomIn } from "./icons";
import ZoomViewer from "./ZoomViewer";

const STEP = 22; // px of horizontal drag per angle frame

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
  const [zoom, setZoom] = useState(false);
  const [hintGone, setHintGone] = useState(false);

  const len = images.length;
  const spinnable = len > 1;
  const src = images[active] ?? images[0];

  const d = useRef({
    startX: 0,
    startIndex: 0,
    moved: false,
    lastTap: 0,
    id: null as number | null,
  });

  // preload every angle so the spin is flicker-free
  useEffect(() => {
    images.forEach((s) => {
      const im = new window.Image();
      im.src = s;
    });
  }, [images]);

  // auto-retire the "drag to rotate" hint
  useEffect(() => {
    if (!spinnable) return;
    const t = setTimeout(() => setHintGone(true), 3500);
    return () => clearTimeout(t);
  }, [spinnable]);

  function onPointerDown(e: React.PointerEvent) {
    // let interactive children (zoom button) get their own clicks
    if ((e.target as HTMLElement).closest("button")) return;
    d.current.startX = e.clientX;
    d.current.startIndex = active;
    d.current.moved = false;
    d.current.id = e.pointerId;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (d.current.id !== e.pointerId) return;
    const dx = e.clientX - d.current.startX;
    if (Math.abs(dx) > 4 && !d.current.moved) {
      d.current.moved = true;
      setHintGone(true);
      // capture lazily so a tap/click isn't retargeted away from children
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (!spinnable) return;
    const frames = Math.round(dx / STEP);
    // drag left → advance to the next angle
    setActive(((d.current.startIndex - frames) % len + len) % len);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (d.current.id !== e.pointerId) return;
    d.current.id = null;
    if (d.current.moved) return;
    // a stationary release = tap; two within 300ms = open zoom
    const now = Date.now();
    if (now - d.current.lastTap < 300) {
      setZoom(true);
      d.current.lastTap = 0;
    } else {
      d.current.lastTap = now;
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl bg-card">
        <div
          className="relative aspect-square w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="pointer-events-none h-full w-full object-cover"
          />
          {badge && <div className="absolute left-3 top-3">{badge}</div>}

          <button
            aria-label="Zoom image"
            onClick={() => setZoom(true)}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition active:scale-90"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {spinnable && (
            <div
              className={`pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur transition-opacity duration-500 ${
                hintGone ? "opacity-0" : "opacity-100"
              }`}
            >
              <Rotate className="h-3.5 w-3.5" />
              Drag to rotate
            </div>
          )}
        </div>
      </div>

      {spinnable && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active
                  ? "border-ink"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <ZoomViewer src={src} alt={alt} onClose={() => setZoom(false)} />
      )}
    </div>
  );
}
