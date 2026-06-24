"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/drops", label: "Feed" },
  { href: "/drops/upcoming", label: "Upcoming" },
  { href: "/drops/in-stock", label: "In Stock" },
];

export default function DropsTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-6 border-b border-line">
      {TABS.map(({ href, label }) => {
        const on = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition ${
              on
                ? "border-ink text-ink"
                : "border-transparent text-dim hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
