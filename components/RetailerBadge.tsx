import { RetailerColor, RETAILER_COLORS } from "@/lib/data";

export default function RetailerBadge({
  retailer,
  color,
}: {
  retailer: string;
  color: RetailerColor;
}) {
  const hex = RETAILER_COLORS[color];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide"
      style={{
        color: hex,
        backgroundColor: `${hex}1A`,
        border: `1px solid ${hex}33`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: hex }}
      />
      {retailer}
    </span>
  );
}
