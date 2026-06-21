"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { figures, Figure, Status, parseDate } from "@/lib/data";

const STATUS_LABEL: Record<Status, string> = {
  preorder_open: "Open",
  preorder_closing: "Closing",
  coming_soon: "Soon",
};

const pad = (n: number) => String(n).padStart(2, "0");
const keyFor = (y: number, m: number, d: number) =>
  `${y}-${pad(m + 1)}-${pad(d)}`;

export default function CalendarPage() {
  const events = useMemo(() => {
    const map: Record<string, Figure[]> = {};
    for (const f of figures) {
      (map[f.preorder_closes] ??= []).push(f);
    }
    return map;
  }, []);

  const earliest = useMemo(
    () => figures.map((f) => f.preorder_closes).sort()[0],
    []
  );

  const [cursor, setCursor] = useState(() => {
    const d = parseDate(earliest);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);

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

  const list = [...figures].sort((a, b) =>
    a.preorder_closes.localeCompare(b.preorder_closes)
  );
  const selectedFigs = selected ? events[selected] ?? [] : [];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Calendar</h1>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous month"
            onClick={() => {
              setSelected(null);
              setCursor(new Date(year, month - 1, 1));
            }}
            className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink transition hover:bg-panel"
          >
            ‹
          </button>
          <span className="w-32 text-center text-sm font-semibold text-ink">
            {monthLabel}
          </span>
          <button
            aria-label="Next month"
            onClick={() => {
              setSelected(null);
              setCursor(new Date(year, month + 1, 1));
            }}
            className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink transition hover:bg-panel"
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
            const sel = selected === key;
            return (
              <button
                key={i}
                onClick={() => evs && setSelected(sel ? null : key)}
                className={`relative aspect-square rounded-lg text-xs transition ${
                  evs ? "cursor-pointer bg-panel hover:bg-line" : "text-dim"
                } ${sel ? "ring-1 ring-ink" : ""}`}
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

      {selected && selectedFigs.length > 0 && (
        <div className="rounded-xl border border-ink p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink">
            {parseDate(selected).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="divide-y divide-line">
            {selectedFigs.map((f) => (
              <Row key={f.id} f={f} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-base font-bold tracking-tight text-ink">
          All Upcoming
        </h2>
        <div className="divide-y divide-line">
          {list.map((f) => (
            <Row key={f.id} f={f} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ f }: { f: Figure }) {
  return (
    <Link
      href={`/drop/${f.id}`}
      className="flex items-center justify-between gap-3 py-3 transition hover:opacity-70"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{f.name}</p>
        <p className="truncate text-[12px] text-dim">{f.series}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span className="text-xs font-semibold text-ink">
          {parseDate(f.preorder_closes).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-dim">
          {STATUS_LABEL[f.status]}
        </span>
      </div>
    </Link>
  );
}
