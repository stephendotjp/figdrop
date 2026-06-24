import { figures } from "@/lib/data";
import DropsTabs from "@/components/DropsTabs";
import DropsCatalog from "@/components/DropsCatalog";

export const metadata = {
  title: "Drops · FigDrop",
  description: "Every anime figure drop on FigDrop, across every retailer.",
};

export default function DropsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-ink">All Drops</h1>
      <DropsTabs />
      <DropsCatalog figures={figures} total={figures.length} />
    </div>
  );
}
