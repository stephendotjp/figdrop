import { Status } from "@/lib/data";

const LABEL: Record<Status, string> = {
  preorder_open: "PREORDER OPEN",
  preorder_closing: "CLOSING SOON",
  coming_soon: "COMING SOON",
};

export default function StatusBadge({
  status,
  className = "",
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-black/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur ${className}`}
    >
      {status === "preorder_closing" && (
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-[softPulse_1.4s_ease-in-out_infinite]" />
      )}
      {LABEL[status]}
    </span>
  );
}
