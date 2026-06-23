import Link from "next/link";
import { figures, getFeatured, stockLevel } from "@/lib/data";
import FeaturedDrop from "@/components/FeaturedDrop";
import FeedCard from "@/components/FeedCard";
import NewThisWeek from "@/components/NewThisWeek";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 text-base font-bold tracking-tight text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Home() {
  const featured = getFeatured();

  const comingSoon = figures.filter((f) => f.status === "coming_soon");
  const almostGone = figures
    .filter((f) => {
      const l = stockLevel(f);
      return l === "last_items" || l === "low";
    })
    .slice(0, 4);
  const almostGoneIds = new Set(almostGone.map((f) => f.id));
  // Full eligible pool — NewThisWeek (client) reorders by onboarding prefs and
  // slices to its display count itself.
  const newThisWeekPool = figures.filter(
    (f) =>
      f.id !== featured.id &&
      f.status !== "coming_soon" &&
      stockLevel(f) !== "sold_out" &&
      !almostGoneIds.has(f.id)
  );

  return (
    <div className="space-y-10">
      <FeaturedDrop figure={featured} />

      <Section title="New This Week">
        <NewThisWeek figures={newThisWeekPool} />
      </Section>

      {almostGone.length > 0 && (
        <Section title="Almost Gone">
          <div className="space-y-8">
            {almostGone.map((f) => (
              <FeedCard key={f.id} figure={f} />
            ))}
          </div>
        </Section>
      )}

      {comingSoon.length > 0 && (
        <Section title="Coming Soon">
          <div className="space-y-8">
            {comingSoon.map((f) => (
              <FeedCard key={f.id} figure={f} />
            ))}
          </div>
        </Section>
      )}

      <Link
        href="/drops"
        className="block rounded-full border border-ink py-4 text-center text-sm font-bold tracking-wide text-ink transition hover:bg-ink hover:text-white"
      >
        See all {figures.length} drops ›
      </Link>
    </div>
  );
}
