"use client";

import { useState } from "react";
import { Figure, BRANDS, brandGroup } from "@/lib/data";
import FilterChips from "@/components/FilterChips";
import FigureCard from "@/components/FigureCard";

// Brand-filterable grid shared by the Feed and In Stock tabs. `total` is the
// full catalog size so the count reads "N of 85" regardless of the base set.
export default function DropsCatalog({
  figures,
  total,
  emptyHint = "No drops in this category yet — check back next week.",
}: {
  figures: Figure[];
  total: number;
  emptyHint?: string;
}) {
  const [chip, setChip] = useState("All");
  const filtered =
    chip === "All"
      ? figures
      : figures.filter((f) => brandGroup(f.manufacturer) === chip);

  return (
    <div className="space-y-5">
      <p className="text-sm text-dim">
        {filtered.length} of {total} figures across every retailer.
      </p>
      <FilterChips chips={BRANDS} active={chip} onChange={setChip} />
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {filtered.map((f) => (
            <FigureCard key={f.id} figure={f} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-dim">
          {emptyHint}
        </p>
      )}
    </div>
  );
}
