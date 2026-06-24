"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { Heart } from "@/components/icons";

// Client island for the detail page's wishlist toggle, so the page itself can
// stay a server component (metadata + static generation).
export default function WishlistButton({ id }: { id: string }) {
  const { isWishlisted, toggle, mounted } = useWishlist();
  const active = mounted && isWishlisted(id);

  return (
    <button
      onClick={() => toggle(id)}
      className={`flex items-center justify-center gap-2 rounded-full border py-4 text-sm font-bold transition ${
        active
          ? "border-ink bg-ink text-white"
          : "border-ink text-ink hover:bg-card"
      }`}
    >
      <Heart
        filled={active}
        className={`h-4 w-4 ${active ? "animate-[pop_.3s_ease]" : ""}`}
      />
      {active ? "WISHLISTED" : "ADD TO WISHLIST"}
    </button>
  );
}
