import { figures, parseDate, Figure } from "@/lib/data";
import DropsTabs from "@/components/DropsTabs";
import FigureCard from "@/components/FigureCard";

export const metadata = {
  title: "Upcoming · FigDrop",
  description: "The anime figure release schedule — what ships next, by month.",
};

// Every figure is an open preorder with a future ship date, so "Upcoming" is the
// release calendar: grouped by release month, soonest first.
export default function UpcomingPage() {
  const sorted = [...figures].sort((a, b) =>
    a.release_date.localeCompare(b.release_date)
  );

  const groups: { key: string; label: string; items: Figure[] }[] = [];
  for (const f of sorted) {
    const key = f.release_date.slice(0, 7); // YYYY-MM
    const last = groups[groups.length - 1];
    if (last?.key === key) {
      last.items.push(f);
    } else {
      groups.push({
        key,
        label: parseDate(f.release_date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        items: [f],
      });
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Upcoming</h1>
      <DropsTabs />
      <div className="space-y-8">
        {groups.map((g) => (
          <section key={g.key}>
            <div className="mb-3 flex items-baseline justify-between gap-2 border-b border-line pb-2">
              <h2 className="text-sm font-bold text-ink">{g.label}</h2>
              <span className="shrink-0 text-[11px] uppercase tracking-wide text-dim">
                {g.items.length} {g.items.length === 1 ? "figure" : "figures"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {g.items.map((f) => (
                <FigureCard key={f.id} figure={f} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
