import { RetailerColor } from "@/lib/data";

// Minimal monochrome label (SNKRS-style brand line). The `color` prop is kept
// for the future dark anime restyle but intentionally unused in the light theme.
export default function RetailerBadge({
  retailer,
}: {
  retailer: string;
  color?: RetailerColor;
}) {
  return (
    <span className="inline-flex items-center rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-dim">
      {retailer}
    </span>
  );
}
