"use client";

import { useEffect, useState } from "react";
import { Figure } from "@/lib/data";
import FeedCard from "./FeedCard";

const COUNT = 6;

// Renders the "New This Week" feed. Server passes the full eligible pool;
// the first COUNT show by default, but if the visitor set onboarding prefs
// (figdrop_prefs), figures matching their series/type are surfaced to the top
// first (stable sort — non-matching aren't hidden, just ranked lower).
export default function NewThisWeek({ figures }: { figures: Figure[] }) {
  const [ordered, setOrdered] = useState(() => figures.slice(0, COUNT));

  useEffect(() => {
    try {
      const raw = localStorage.getItem("figdrop_prefs");
      if (!raw) return;
      const prefs = JSON.parse(raw) as { series?: string[]; types?: string[] };
      const series = new Set(prefs.series ?? []);
      const types = new Set(prefs.types ?? []);
      if (series.size === 0 && types.size === 0) return;

      const matches = (f: Figure) => series.has(f.series) || types.has(f.type);
      const sorted = [...figures].sort(
        (a, b) => Number(matches(b)) - Number(matches(a))
      );
      setOrdered(sorted.slice(0, COUNT));
    } catch {
      // ignore malformed prefs — keep the default order
    }
  }, [figures]);

  return (
    <div className="space-y-8">
      {ordered.map((f) => (
        <FeedCard key={f.id} figure={f} />
      ))}
    </div>
  );
}
