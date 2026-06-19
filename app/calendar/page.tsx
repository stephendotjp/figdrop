"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { figures, Figure, Status, parseDate } from "@/lib/data";
import RetailerBadge from "@/components/RetailerBadge";

const STATUS_DOT: Record<Status, string> = {
  preorder_open: "#F0C060",
  preorder_closing: "#E8629A",
  coming_soon: "#4DA8FF",
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
        <h1 className="text-xl font-extrabold">Release Calendar</h1>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous month"
            onClick={() => {
              setSelected(null);
              setCursor(new Date(year, month - 1, 1));
            }}
            className="grid h-8 w-8 place-items-center rounded-full bg-panel text-dim transition hover:text-ink"
          >
            ‹
          </button>
          <span className="w-32 text-center text-sm font-semibold">
            {monthLabel}
          </span>
          <button
            aria-label="Next month"
            onClick={() => {
              setSelected(null);
              setCursor(new Date(year, month + 1, 1));
            }}
            className="grid h-8 w-8 place-items-center rounded-full bg-panel text-dim transition hover:text-ink"
          >
            ›
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-white/5 bg-card p-3">
        <div className="grid grid-cols-7 text-center text-[10px] uppercase tracking-wider text-muted">
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
                  evs
                    ? "cursor-pointer bg-panel hover:bg-panel/70"
                    : "text-muted"
                } ${sel ? "ring-1 ring-gold" : ""}`}
              >
                <span className="absolute left-1.5 top-1 text-[11px]">{c}</span>
                {evs && (
                  <span className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-0.5">
                    {evs.slice(0, 3).map((f, j) => (
                      <span
                        key={j}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: STATUS_DOT[f.status] }}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-dim">
        <Legend color="#F0C060" label="Preorder open" />
        <Legend color="#E8629A" label="Closing soon" />
        <Legend color="#4DA8FF" label="Releasing soon" />
      </div>

      {selected && selectedFigs.length > 0 && (
        <div className="rounded-2xl border border-gold/30 bg-card p-4">
          <p className="mb-3 text-xs uppercase tracking-wider text-gold">
            {parseDate(selected).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="space-y-2">
            {selectedFigs.map((f) => (
              <Row key={f.id} f={f} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-dim">
          All Upcoming
        </h2>
        <div className="space-y-2">
          {list.map((f) => (
            <Row key={f.id} f={f} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function Row({ f }: { f: Figure }) {
  return (
    <Link
      href={`/drop/${f.id}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-panel/40 p-3 transition hover:border-white/10"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{f.name}</p>
        <p className="truncate text-[11px] text-muted">{f.series}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <RetailerBadge retailer={f.retailer} color={f.retailer_color} />
        <span className="text-xs font-semibold text-dim">
          {parseDate(f.preorder_closes).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </Link>
  );
}
