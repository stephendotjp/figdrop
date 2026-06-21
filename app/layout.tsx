import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FigDrop — Anime Figure Preorder Drops",
  description: "Track and preorder premium anime figure drops. SNKRS energy, figure skin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#0a0a0a] font-sans text-ink antialiased">
        <TopNav />
        <main className="mx-auto w-full max-w-screen-sm px-4 pb-24 pt-4 md:max-w-screen-lg md:px-8 md:pb-12 md:pt-24">
          <div className="animate-[fadeIn_.4s_ease]" key="page">
            {children}
          </div>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
