import { figures, stockLevel } from "@/lib/data";
import DropsTabs from "@/components/DropsTabs";
import DropsCatalog from "@/components/DropsCatalog";

export const metadata = {
  title: "In Stock · FigDrop",
  description: "Anime figures you can still preorder right now on FigDrop.",
};

export default function InStockPage() {
  const inStock = figures.filter((f) => stockLevel(f) !== "sold_out");

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-ink">In Stock</h1>
      <DropsTabs />
      <DropsCatalog
        figures={inStock}
        total={figures.length}
        emptyHint="Nothing orderable right now — check Upcoming."
      />
    </div>
  );
}
