"use client";

import Link from "next/link";
import { figures } from "@/lib/data";
import { useWishlist } from "@/hooks/useWishlist";
import FigureCard from "@/components/FigureCard";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-card py-20 text-center">
      <svg
        viewBox="0 0 24 24"
        className="h-16 w-16 text-ink"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
      <p className="mt-5 text-base font-bold text-ink">
        No figures wishlisted yet
      </p>
      <p className="mt-1 max-w-xs text-sm text-dim">
        Tap the heart on any drop to save it here and track its preorder window.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
      >
        Browse drops
      </Link>
    </div>
  );
}

export default function WishlistPage() {
  const { ids, mounted } = useWishlist();
  const items = figures.filter((f) => ids.includes(f.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Wishlist</h1>
        {mounted && items.length > 0 && (
          <p className="mt-1 text-sm text-dim">
            {items.length} {items.length === 1 ? "figure" : "figures"} saved.
          </p>
        )}
      </div>

      {!mounted ? null : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((f) => (
            <FigureCard key={f.id} figure={f} cta />
          ))}
        </div>
      )}
    </div>
  );
}
