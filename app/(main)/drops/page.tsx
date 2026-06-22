"use client";

import { useState } from "react";
import { figures, BRANDS, brandGroup } from "@/lib/data";
import FilterChips from "@/components/FilterChips";
import FigureCard from "@/components/FigureCard";

export default function DropsPage() {
  const [chip, setChip] = useState("All");
  const filtered =
    chip === "All"
      ? figures
      : figures.filter((f) => brandGroup(f.manufacturer) === chip);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">All Drops</h1>
        <p className="mt-1 text-sm text-dim">
          {filtered.length} of {figures.length} figures across every retailer.
        </p>
      </div>

      <FilterChips chips={BRANDS} active={chip} onChange={setChip} />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {filtered.map((f) => (
            <FigureCard key={f.id} figure={f} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-dim">
          No drops in this category yet — check back next week.
        </p>
      )}
    </div>
  );
}
