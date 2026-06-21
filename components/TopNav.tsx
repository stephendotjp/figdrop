"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, Calendar, Heart, Search, Bell } from "./icons";

type NavItem = {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactNode;
};

const NAV: NavItem[] = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/drops", label: "Drops", Icon: Flame },
  { href: "/calendar", label: "Calendar", Icon: Calendar },
  { href: "/wishlist", label: "Wishlist", Icon: Heart },
];

function Logo() {
  return (
    <Link
      href="/"
      className="text-lg font-extrabold uppercase tracking-tight text-accent"
    >
      FigDrop
    </Link>
  );
}

function IconButtons() {
  return (
    <div className="flex items-center gap-1 text-ink">
      <button
        aria-label="Search"
        className="grid h-9 w-9 place-items-center rounded-full transition hover:opacity-60"
      >
        <Search />
      </button>
      <button
        aria-label="Alerts"
        className="grid h-9 w-9 place-items-center rounded-full transition hover:opacity-60"
      >
        <Bell />
      </button>
    </div>
  );
}

export default function TopNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile sticky header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-[#0a0a0a]/85 px-4 py-3 backdrop-blur md:hidden">
        <Logo />
        <IconButtons />
      </header>

      {/* Desktop top nav */}
      <nav className="fixed left-0 top-0 z-40 hidden w-full items-center justify-between border-b border-line bg-[#0a0a0a]/85 px-8 py-4 backdrop-blur md:flex">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="flex items-center gap-1">
            {NAV.map(({ href, label, Icon }) => {
              const on = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                    on ? "text-ink" : "text-dim hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        <IconButtons />
      </nav>
    </>
  );
}
