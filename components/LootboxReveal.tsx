"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Figure } from "@/lib/data";
import FigureImage from "@/components/FigureImage";
import { Close } from "./icons";

// Timing (ms→s shorthand below): box shakes ~0.6s, then lid flies / particles
// burst / glow at 0.6s, then cards pop out staggered from ~0.85s.
const PARTICLE_COLORS = ["#a855f7", "#c084fc", "#f0abfc", "#ffffff"];

export default function LootboxReveal({
  figs,
  dateLabel,
  onClose,
}: {
  figs: Figure[];
  dateLabel: string;
  onClose: () => void;
}) {
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

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.5;
        const dist = 90 + Math.random() * 90;
        return {
          px: Math.cos(angle) * dist,
          py: Math.sin(angle) * dist,
          size: 5 + Math.random() * 7,
          color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
          delay: Math.random() * 0.08,
        };
      }),
    []
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[radial-gradient(circle_at_50%_28%,#3b0764_0%,#0b0512_62%)] animate-[fadeIn_.2s_ease]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="fixed right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition active:scale-90"
        style={{ top: "max(1rem, env(safe-area-inset-top))" }}
      >
        <Close className="h-5 w-5" />
      </button>

      {/* Box flourish — pure CSS, skipped entirely under reduced motion */}
      {!reduce && (
        <div
          className="pointer-events-none absolute inset-x-0 top-[20%] flex justify-center"
          aria-hidden
        >
          <div className="relative h-32 w-32">
            {/* glow burst */}
            <div
              className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
              style={{
                background:
                  "radial-gradient(circle, #c084fc 0%, transparent 70%)",
                animation: "lootGlow .7s ease-out .55s forwards",
              }}
            />
            {/* particles */}
            {particles.map((p, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 rounded-full"
                style={
                  {
                    width: p.size,
                    height: p.size,
                    marginLeft: -p.size / 2,
                    marginTop: -p.size / 2,
                    background: p.color,
                    boxShadow: `0 0 8px ${p.color}`,
                    opacity: 0,
                    "--px": `${p.px}px`,
                    "--py": `${p.py}px`,
                    animation: `lootParticle .7s ease-out ${0.6 + p.delay}s forwards`,
                  } as React.CSSProperties
                }
              />
            ))}
            {/* box (shakes as a unit) */}
            <div
              className="absolute inset-0"
              style={{ animation: "lootShake .6s ease-in-out" }}
            >
              {/* lid */}
              <div
                className="absolute -top-1 left-1/2 h-7 w-32 -translate-x-1/2 rounded-md bg-gradient-to-b from-[#a855f7] to-[#7c3aed] shadow-lg"
                style={{
                  animation:
                    "lootLid .55s cubic-bezier(.2,.7,.2,1) .6s both",
                }}
              >
                <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-yellow-300 shadow-[0_0_8px_#fde047]" />
              </div>
              {/* body */}
              <div
                className="absolute bottom-0 h-24 w-32 overflow-hidden rounded-md bg-gradient-to-b from-[#7c3aed] to-[#4c1d95] shadow-xl ring-1 ring-white/20"
                style={{ animation: "lootBoxOut .5s ease-in .65s forwards" }}
              >
                <div className="absolute inset-x-0 top-2 h-px bg-white/30" />
                <div className="absolute inset-0 grid place-items-center text-3xl font-black text-white/90">
                  ?
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative mx-auto w-full max-w-screen-sm px-5 pb-24 pt-16">
        <header
          className="mb-6 text-center"
          style={reduce ? undefined : { animation: "fadeIn .4s ease .85s both" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c084fc]">
            You unboxed
          </p>
          <h2 className="mt-1 text-lg font-bold text-white">
            {figs.length} {figs.length === 1 ? "drop" : "drops"}
          </h2>
          <p className="mt-0.5 text-xs text-white/50">{dateLabel}</p>
        </header>

        <div className="grid grid-cols-2 gap-4">
          {figs.map((f, i) => (
            <Link
              key={f.id}
              href={`/drop/${f.id}`}
              className="group block"
              style={
                reduce
                  ? undefined
                  : {
                      animation:
                        "lootPop .5s cubic-bezier(.2,.8,.2,1) both",
                      animationDelay: `${0.85 + Math.min(i, 12) * 0.055}s`,
                    }
              }
            >
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-white ring-1 ring-white/15 transition group-active:scale-95">
                <FigureImage figure={f} />
              </div>
              <h3 className="mt-2 truncate text-sm font-semibold text-white">
                {f.name}
              </h3>
              <p className="mt-0.5 text-sm font-semibold text-white/70">
                ¥{f.price_jpy.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
