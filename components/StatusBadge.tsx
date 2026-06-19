import { Status } from "@/lib/data";

const META: Record<Status, { label: string; className: string; dot?: boolean }> = {
  preorder_open: {
    label: "PREORDER OPEN",
    className: "bg-gold text-black",
  },
  preorder_closing: {
    label: "CLOSING SOON",
    className: "bg-pink text-white animate-[softPulse_1.6s_ease-in-out_infinite]",
  },
  coming_soon: {
    label: "COMING SOON",
    className: "bg-black/40 text-dim border border-dashed border-white/20",
  },
};

export default function StatusBadge({
  status,
  className = "",
}: {
  status: Status;
  className?: string;
}) {
  const m = META[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wider ${m.className} ${className}`}
    >
      {m.label}
    </span>
  );
}
