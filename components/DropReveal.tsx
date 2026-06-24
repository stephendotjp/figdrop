"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Figure } from "@/lib/data";
import FigureImage from "@/components/FigureImage";
import StockBadge from "@/components/StockBadge";
import { Close } from "./icons";

type Phase = "sealed" | "opening" | "open";

const TEAR_DISTANCE = 150; // px of drag to fully tear the seal
const TEAR_COMMIT = 0.42; // fraction past which release completes the tear
const SWIPE = 46; // px swipe to advance the carousel
const FLECK_COLORS = ["#e5e7eb", "#f8fafc", "#cbd5e1", "#FF1A1A"];

export default function DropReveal({
  figs,
  dateLabel,
  onClose,
}: {
  figs: Figure[];
  dateLabel: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("sealed");
  const [reduce, setReduce] = useState(false);

  // lock body scroll + escape to close (mirrors ZoomViewer)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    setReduce(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
    );
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[radial-gradient(circle_at_50%_35%,#1a1a1f_0%,#0a0a0c_70%)] animate-[fadeIn_.2s_ease]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex items-center justify-between px-5 pb-2"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
            FigDrop · Drop day
          </p>
          <p className="mt-0.5 text-sm font-semibold text-white">{dateLabel}</p>
        </div>
        <button
          aria-label="Back to calendar"
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition active:scale-90"
        >
          <Close className="h-5 w-5" />
        </button>
      </div>

      {phase === "open" ? (
        <Carousel figs={figs} reduce={reduce} />
      ) : (
        <SealedBag
          count={figs.length}
          dateLabel={dateLabel}
          phase={phase}
          reduce={reduce}
          onOpen={() => setPhase(reduce ? "open" : "opening")}
          onTorn={() => setPhase("open")}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sealed mylar drop-bag — drag (or tap) to tear the top seal open            */
/* -------------------------------------------------------------------------- */
function SealedBag({
  count,
  dateLabel,
  phase,
  reduce,
  onOpen,
  onTorn,
}: {
  count: number;
  dateLabel: string;
  phase: Phase;
  reduce: boolean;
  onOpen: () => void;
  onTorn: () => void;
}) {
  const [tear, setTear] = useState(0); // 0..1 peel progress
  const [snap, setSnap] = useState(false); // smooth-transition the strip
  const drag = useRef({ startX: 0, id: null as number | null, moved: false });

  const flecks = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
        const dist = 70 + Math.random() * 90;
        return {
          px: Math.cos(angle) * dist,
          py: Math.sin(angle) * dist,
          pr: `${(Math.random() - 0.5) * 360}deg`,
          size: 4 + Math.random() * 6,
          color: FLECK_COLORS[i % FLECK_COLORS.length],
          delay: Math.random() * 0.06,
        };
      }),
    []
  );

  // when the tear completes, fling the strip off then swap to the carousel
  function complete() {
    setSnap(true);
    setTear(1);
    onOpen();
    setTimeout(onTorn, 360);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (phase !== "sealed") return;
    drag.current = { startX: e.clientX, id: e.pointerId, moved: false };
    setSnap(false);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (drag.current.id !== e.pointerId || phase !== "sealed") return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    setTear(Math.max(0, Math.min(1, dx / TEAR_DISTANCE)));
  }
  function onPointerUp(e: React.PointerEvent) {
    if (drag.current.id !== e.pointerId || phase !== "sealed") return;
    drag.current.id = null;
    if (!drag.current.moved || tear >= TEAR_COMMIT) {
      complete(); // a tap, or a drag past the commit point, opens it
    } else {
      setSnap(true);
      setTear(0); // snap back
    }
  }

  const opening = phase === "opening";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Tear open ${count} ${count === 1 ? "drop" : "drops"} from ${dateLabel}`}
        onKeyDown={(e) => e.key === "Enter" && phase === "sealed" && complete()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-[300px] w-[226px] cursor-grab touch-none select-none active:cursor-grabbing"
        style={
          opening
            ? { animation: "bagVanish .36s ease forwards" }
            : reduce
              ? undefined
              : { animation: "bagDrop .45s cubic-bezier(.2,.8,.2,1)" }
        }
      >
        {/* opened gap revealed under the seal */}
        <div className="absolute inset-x-3 top-[44px] h-2 rounded-sm bg-black/70" />

        {/* bag body (foil) */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#cfd3da] via-[#f4f5f7] to-[#aab0ba] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] ring-1 ring-white/40">
          {/* holographic sheen sweep */}
          {!reduce && (
            <div
              className="pointer-events-none absolute -inset-y-8 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-md"
              style={{ animation: "foilSheen 3.5s ease-in-out infinite" }}
            />
          )}
          {/* faint iridescent tint */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,26,26,0.05),transparent_30%,rgba(120,160,255,0.06)_70%,transparent)]" />

          {/* matte streetwear label panel */}
          <div className="absolute inset-x-5 top-[78px] rounded-xl bg-[#0e0e10] px-4 py-5 text-center shadow-lg ring-1 ring-white/10">
            <p className="text-lg font-black uppercase tracking-tight text-accent">
              FigDrop
            </p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">
              Drop
            </p>
            <p className="mt-1 text-[11px] font-medium text-white/50">
              {dateLabel}
            </p>
            <div className="mx-auto mt-4 h-px w-12 bg-white/15" />
            <p className="mt-3 text-2xl font-black tabular-nums text-white">
              {count}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/55">
              {count === 1 ? "Figure" : "Figures"}
            </p>
          </div>
        </div>

        {/* tear-off top seal (peels around its top-left as you drag) */}
        <div
          className="absolute inset-x-0 top-0 h-11 origin-top-left overflow-hidden rounded-t-2xl bg-[repeating-linear-gradient(90deg,#bcc1c9_0,#eef0f3_3px,#bcc1c9_6px)] ring-1 ring-white/40"
          style={{
            transform: `translateY(${-tear * 64}px) rotate(${-tear * 72}deg)`,
            opacity: tear > 0.8 ? (1 - tear) / 0.2 : 1,
            transition: snap ? "transform .36s ease, opacity .36s ease" : "none",
          }}
        >
          {/* serrated lower edge of the seal */}
          <div className="absolute inset-x-0 bottom-0 h-2 bg-[repeating-linear-gradient(135deg,transparent_0,transparent_4px,#0a0a0c33_4px,#0a0a0c33_5px)]" />
          {/* tear notch hint on the right */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-ink/40">
            tear ▸
          </div>
        </div>

        {/* foil flecks scatter on tear */}
        {opening &&
          flecks.map((f, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-[40px] rounded-[1px]"
              style={
                {
                  width: f.size,
                  height: f.size,
                  marginLeft: -f.size / 2,
                  background: f.color,
                  boxShadow: `0 0 6px ${f.color}`,
                  opacity: 0,
                  "--px": `${f.px}px`,
                  "--py": `${f.py}px`,
                  "--pr": f.pr,
                  animation: `foilFleck .65s ease-out ${f.delay}s forwards`,
                } as React.CSSProperties
              }
            />
          ))}
      </div>

      {phase === "sealed" && (
        <p
          className="mt-8 text-center text-[12px] font-medium uppercase tracking-[0.18em] text-white/50"
          style={reduce ? undefined : { animation: "softPulse 2s ease-in-out infinite" }}
        >
          Drag to tear open
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Swipeable carousel of the day's drops                                      */
/* -------------------------------------------------------------------------- */
function Carousel({ figs, reduce }: { figs: Figure[]; reduce: boolean }) {
  const [index, setIndex] = useState(0);
  const [dx, setDx] = useState(0);
  const [snap, setSnap] = useState(true);
  const drag = useRef({ startX: 0, id: null as number | null, moved: false, dx: 0 });
  const len = figs.length;

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("a,button")) return;
    drag.current = { startX: e.clientX, id: e.pointerId, moved: false, dx: 0 };
    setSnap(false);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (drag.current.id !== e.pointerId) return;
    const d = e.clientX - drag.current.startX;
    drag.current.dx = d;
    if (Math.abs(d) > 4) drag.current.moved = true;
    setDx(d);
  }
  function onPointerUp(e: React.PointerEvent) {
    if (drag.current.id !== e.pointerId) return;
    drag.current.id = null;
    const d = drag.current.dx;
    setSnap(true);
    setIndex((i) => {
      if (d <= -SWIPE && i < len - 1) return i + 1;
      if (d >= SWIPE && i > 0) return i - 1;
      return i;
    });
    setDx(0);
  }

  const go = (next: number) => {
    setSnap(true);
    setIndex(Math.max(0, Math.min(len - 1, next)));
  };

  return (
    <div
      className="flex flex-1 flex-col"
      style={reduce ? undefined : { animation: "cardIn .3s ease" }}
    >
      <div
        className="relative flex-1 touch-pan-y select-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translateX(calc(${-index * 100}% + ${dx}px))`,
            transition: snap ? "transform .3s cubic-bezier(.2,.8,.2,1)" : "none",
          }}
        >
          {figs.map((f) => (
            <div
              key={f.id}
              className="flex h-full w-full shrink-0 flex-col px-6"
            >
              <div className="relative flex min-h-0 flex-1 items-center justify-center">
                <div className="relative aspect-square w-full max-h-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-white/10">
                  <FigureImage figure={f} fit="contain" />
                  <div className="absolute left-3 top-3">
                    <StockBadge figure={f} />
                  </div>
                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  {f.series !== "—" ? `${f.series} · ` : ""}
                  {f.retailer}
                </p>
                <h3 className="mt-1 truncate text-base font-bold text-white">
                  {f.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-white">
                  ¥{f.price_jpy.toLocaleString()}
                  <span className="ml-2 text-white/45">~${f.price_usd}</span>
                </p>
                <Link
                  href={`/drop/${f.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition active:scale-95"
                >
                  Preorder →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* desktop / non-touch nav */}
        {index > 0 && (
          <button
            aria-label="Previous"
            onClick={() => go(index - 1)}
            className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 active:scale-90 sm:grid"
          >
            ‹
          </button>
        )}
        {index < len - 1 && (
          <button
            aria-label="Next"
            onClick={() => go(index + 1)}
            className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 active:scale-90 sm:grid"
          >
            ›
          </button>
        )}
      </div>

      <div
        className="flex items-center justify-center gap-3 py-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
          {index + 1} / {len}
        </span>
      </div>
    </div>
  );
}
