import { Figure, stockLevel } from "@/lib/data";

export default function StockBadge({
  figure,
  className = "",
}: {
  figure: Figure;
  className?: string;
}) {
  const level = stockLevel(figure);
  if (level === "in_stock") return null;

  if (level === "sold_out") {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-black/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur ${className}`}
      >
        Sold Out
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white animate-[softPulse_1.4s_ease-in-out_infinite]" />
      Only {figure.quantity} left
    </span>
  );
}
