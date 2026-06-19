"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, Calendar, Heart } from "./icons";

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

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-white/5 bg-void/90 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-screen-sm items-center justify-around px-2 py-2">
        {NAV.map(({ href, label, Icon }) => {
          const on = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-1"
            >
              <Icon className={`h-5 w-5 ${on ? "text-gold" : "text-muted"}`} />
              <span
                className={`text-[10px] font-medium ${
                  on ? "text-gold" : "text-muted"
                }`}
              >
                {label}
              </span>
              <span
                className={`h-1 w-1 rounded-full ${
                  on ? "bg-gold" : "bg-transparent"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
