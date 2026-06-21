import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

// Layout for the main app (feed, drops, calendar, wishlist, detail). The
// onboarding splash at /welcome lives outside this group so it has no nav/chrome.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-screen-sm px-4 pb-24 pt-4 md:max-w-screen-lg md:px-8 md:pb-12 md:pt-24">
        <div className="animate-[fadeIn_.4s_ease]" key="page">
          {children}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
