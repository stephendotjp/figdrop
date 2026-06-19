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
            className={`relative whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              on ? "text-black" : "text-dim hover:text-ink"
            }`}
          >
            {on && (
              <span className="absolute inset-0 rounded-full bg-gold transition-all duration-300" />
            )}
            <span className="relative z-10">{c}</span>
          </button>
        );
      })}
    </div>
  );
}
