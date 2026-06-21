"use client";

export default function FilterChips({
  chips,
  active,
  onChange,
}: {
  chips: string[];
  active: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
      {chips.map((c) => {
        const on = c === active;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${
              on
                ? "border-white bg-white text-black"
                : "border-line bg-panel text-dim hover:border-dim hover:text-ink"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
