import Link from "next/link";

// Onboarding splash, SNKRS-style. No real auth — Log In / Join start the taste
// picker (`/onboarding`); "Continue as guest" enters the feed (`/`) directly.
// Lives outside the (main) route group, so no nav chrome.
// Normal document flow + 100svh so iOS browser UI never clips the bottom actions.
export default function Welcome() {
  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden bg-black text-white">
      {/* Full-bleed hero + overlay */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/figures/kaho-hinoshita-love-live/01.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/90" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-md flex-col justify-between gap-10 px-6 pt-12 pb-[calc(env(safe-area-inset-bottom)+2.5rem)]">
        <span className="text-2xl font-extrabold uppercase tracking-tight text-accent">
          FigDrop
        </span>

        <div className="space-y-7">
          <h1 className="text-[28px] font-bold leading-tight">
            Your ultimate source for figure drops, pre-order windows and
            exclusive collectibles.
          </h1>

          <div className="space-y-3">
            <div className="flex gap-3">
              <Link
                href="/onboarding"
                className="flex-1 rounded-full border border-white/70 py-3.5 text-center text-sm font-bold transition hover:bg-white/10"
              >
                Log In
              </Link>
              <Link
                href="/onboarding"
                className="flex-1 rounded-full bg-white py-3.5 text-center text-sm font-bold text-black transition hover:opacity-90"
              >
                Join
              </Link>
            </div>
            <Link
              href="/"
              className="block py-2 text-center text-sm font-semibold text-white/80 underline-offset-4 transition hover:text-white hover:underline"
            >
              Continue as guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
