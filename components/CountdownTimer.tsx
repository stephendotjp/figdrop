"use client";

import { useEffect, useState } from "react";

type Parts = { d: number; h: number; m: number; s: number };

function diff(target: number): Parts {
  const ms = Math.max(0, target - Date.now());
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor(ms / 3600000) % 24,
    m: Math.floor(ms / 60000) % 60,
    s: Math.floor(ms / 1000) % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function CountdownTimer({
  target,
  className = "",
}: {
  target: string;
  className?: string;
}) {
  const t = new Date(target).getTime();
  // Start null so the server render and first client render match (no hydration mismatch).
  const [time, setTime] = useState<Parts | null>(null);

  useEffect(() => {
    setTime(diff(t));
    const id = setInterval(() => setTime(diff(t)), 1000);
    return () => clearInterval(id);
  }, [t]);

  const v = time ?? { d: 0, h: 0, m: 0, s: 0 };
  const units: [number, string][] = [
    [v.d, "DAYS"],
    [v.h, "HRS"],
    [v.m, "MIN"],
    [v.s, "SEC"],
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {units.map(([val, label], i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="font-mono text-xl font-bold tabular-nums text-ink">
              {pad(val)}
            </span>
            <span className="text-[9px] tracking-widest text-dim">
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="-mt-3 text-line">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
