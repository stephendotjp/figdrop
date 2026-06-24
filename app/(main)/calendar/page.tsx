"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { figures, Figure, parseDate, figureSlug } from "@/lib/data";
import FigureImage from "@/components/FigureImage";
import DropReveal from "@/components/DropReveal";

const pad = (n: number) => String(n).padStart(2, "0");
const keyFor = (y: number, m: number, d: number) =>
  `${y}-${pad(m + 1)}-${pad(d)}`;

const fullDate = (s: string) =>
  parseDate(s).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export default function CalendarPage() {
  // Group figures by the day they were added to FigDrop — each scrape session
  // is a "drop event". (release_date is the manufacturer ship date, not shown here.)
  const events = useMemo(() => {
    const map: Record<string, Figure[]> = {};
    for (const f of figures) {
      (map[f.droppedAt] ??= []).push(f);
    }
    return map;
  }, []);

  // Distinct drop days, newest first — the "Recent Drops" batches.
  const dropDays = useMemo(
    () => Object.keys(events).sort((a, b) => b.localeCompare(a)),
    [events]
  );

  const [cursor, setCursor] = useState(() => {
    const d = parseDate(dropDays[0]);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  // Day whose drops are being revealed in the fullscreen drop-bag overlay.
  const [openDay, setOpenDay] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startPad = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = cursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Calendar</h1>
          <p className="mt-0.5 text-[12px] text-dim">When figures dropped on FigDrop</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous month"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink transition hover:bg-card"
          >
            ‹
          </button>
          <span className="w-32 text-center text-sm font-semibold text-ink">
            {monthLabel}
          </span>
          <button
            aria-label="Next month"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink transition hover:bg-card"
          >
            ›
          </button>
        </div>
      </header>

      <div className="rounded-xl border border-line p-3">
        <div className="grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wider text-dim">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) => {
            if (c === null) return <div key={i} />;
            const key = keyFor(year, month, c);
            const evs = events[key];
            return (
              <button
                key={i}
                onClick={() => evs && setOpenDay(key)}
                className={`relative aspect-square rounded-lg text-xs transition ${
                  evs ? "cursor-pointer bg-card hover:bg-line" : "text-dim"
                }`}
              >
                <span className="absolute left-1.5 top-1 text-[11px] text-ink">
                  {c}
                </span>
                {evs && (
                  <span className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-0.5">
                    {evs.slice(0, 3).map((_, j) => (
                      <span
                        key={j}
                        className="h-1.5 w-1.5 rounded-full bg-ink"
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="-mt-1 text-center text-[11px] text-dim">
        Tap a drop day to see what dropped
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold tracking-tight text-ink">
          Recent Drops
        </h2>
        <div className="space-y-8">
          {dropDays.map((day) => (
            <div key={day}>
              <div className="mb-3 flex items-baseline justify-between gap-2 border-b border-line pb-2">
                <h3 className="text-sm font-bold text-ink">{fullDate(day)}</h3>
                <span className="shrink-0 text-[11px] uppercase tracking-wide text-dim">
                  {events[day].length}{" "}
                  {events[day].length === 1 ? "figure" : "figures"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {events[day].map((f) => (
                  <DropCard key={f.id} f={f} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {openDay && (
        <DropReveal
          key={openDay}
          figs={events[openDay]}
          dateLabel={fullDate(openDay)}
          onClose={() => setOpenDay(null)}
        />
      )}
    </div>
  );
}

function DropCard({ f }: { f: Figure }) {
  return (
    <Link href={`/drops/t/${figureSlug(f)}`} className="group block">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-card">
        <FigureImage figure={f} />
      </div>
      <h3 className="mt-2 truncate text-sm font-semibold text-ink">{f.name}</h3>
      <p className="mt-0.5 text-sm font-semibold text-ink">
        ¥{f.price_jpy.toLocaleString()}
      </p>
    </Link>
  );
}
