import { figures } from "@/lib/data";
import FigureCard from "@/components/FigureCard";

export default function DropsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold">All Drops</h1>
        <p className="mt-1 text-sm text-muted">
          {figures.length} figures tracked across every retailer.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {figures.map((f) => (
          <FigureCard key={f.id} figure={f} />
        ))}
      </div>
    </div>
  );
}
