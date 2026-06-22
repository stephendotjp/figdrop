"use client";

import { useEffect, useRef, useState } from "react";
import { Close } from "./icons";

const MIN = 1;
const MAX = 4;
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export default function ZoomViewer({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [smooth, setSmooth] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const g = useRef({
    dist: 0,
    scale: 1,
    panX: 0,
    panY: 0,
    tx: 0,
    ty: 0,
    moved: false,
    lastTap: 0,
  });

  // lock body scroll + escape to close
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // keep pan within bounds for the current scale
  function clampPan(x: number, y: number, s: number) {
    const r = containerRef.current?.getBoundingClientRect();
    const maxX = r ? ((s - 1) * r.width) / 2 : 0;
    const maxY = r ? ((s - 1) * r.height) / 2 : 0;
    return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    g.current.moved = false;
    setSmooth(false);
    if (pts.length === 1) {
      g.current.panX = pts[0].x;
      g.current.panY = pts[0].y;
      g.current.tx = tx;
      g.current.ty = ty;
    } else if (pts.length === 2) {
      g.current.dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      g.current.scale = scale;
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];

    if (pts.length >= 2) {
      g.current.moved = true;
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ns = clamp(g.current.scale * (d / g.current.dist), MIN, MAX);
      setScale(ns);
      const p = clampPan(tx, ty, ns);
      setTx(p.x);
      setTy(p.y);
    } else if (pts.length === 1 && scale > 1) {
      const p = pts[0];
      const dx = p.x - g.current.panX;
      const dy = p.y - g.current.panY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) g.current.moved = true;
      const c = clampPan(g.current.tx + dx, g.current.ty + dy, scale);
      setTx(c.x);
      setTy(c.y);
    } else if (pts.length === 1) {
      const p = pts[0];
      if (Math.abs(p.x - g.current.panX) > 4 || Math.abs(p.y - g.current.panY) > 4)
        g.current.moved = true;
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    const remaining = [...pointers.current.values()];

    if (remaining.length === 0) {
      if (!g.current.moved) {
        const now = Date.now();
        if (now - g.current.lastTap < 300) {
          // double-tap: toggle zoom
          setSmooth(true);
          if (scale > 1) {
            setScale(1);
            setTx(0);
            setTy(0);
          } else {
            setScale(2.5);
          }
          g.current.lastTap = 0;
        } else {
          g.current.lastTap = now;
        }
      }
    } else if (remaining.length === 1) {
      // re-baseline pan to the finger that's still down
      g.current.panX = remaining[0].x;
      g.current.panY = remaining[0].y;
      g.current.tx = tx;
      g.current.ty = ty;
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-[fadeIn_.2s_ease]"
      onClick={(e) => {
        // tap on backdrop (not the image) closes
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition active:scale-90"
        style={{ top: "max(1rem, env(safe-area-inset-top))" }}
      >
        <Close className="h-5 w-5" />
      </button>

      <div
        ref={containerRef}
        className="relative h-full w-full touch-none select-none"
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
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          style={{
            transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
            transition: smooth ? "transform .25s ease" : "none",
          }}
        />
      </div>

      <p className="pointer-events-none absolute bottom-6 left-0 right-0 text-center text-[11px] uppercase tracking-widest text-white/50">
        Pinch or double-tap to zoom
      </p>
    </div>
  );
}
