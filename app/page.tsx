"use client";

import { useState } from "react";
import { figures, getFeatured, TYPES, Figure } from "@/lib/data";
import FeaturedDrop from "@/components/FeaturedDrop";
import FilterChips from "@/components/FilterChips";
import FigureCard from "@/components/FigureCard";

function matches(f: Figure, chip: string): boolean {
  if (chip === "All") return true;
  if (chip === "Scale") return f.type.includes("Scale");
  if (chip === "Bunny Ver.") return f.name.includes("Bunny");
  return f.type === chip;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-dim">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Home() {
  const [chip, setChip] = useState("All");
  const featured = getFeatured();
  const newThisWeek = figures.filter((f) => f.status !== "coming_soon");
  const comingSoon = figures.filter((f) => f.status === "coming_soon");
  const filtered = figures.filter((f) => matches(f, chip));

  return (
    <div className="space-y-7">
      <FeaturedDrop figure={featured} />
      <FilterChips chips={TYPES} active={chip} onChange={setChip} />

      {chip === "All" ? (
        <>
          <Section title="New This Week">
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {newThisWeek.map((f) => (
                <FigureCard key={f.id} figure={f} variant="row" />
              ))}
            </div>
          </Section>

          <Section title="Coming Soon">
            <div className="space-y-3">
              {comingSoon.map((f) => (
                <FigureCard key={f.id} figure={f} variant="list" />
              ))}
            </div>
          </Section>
        </>
      ) : (
        <Section title={`${chip} · ${filtered.length}`}>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {filtered.map((f) => (
                <FigureCard key={f.id} figure={f} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-muted">
              No drops in this category yet — check back next week.
            </p>
          )}
        </Section>
      )}
    </div>
  );
}
