import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import FocusMiniIndicator from "@/components/tierup/FocusMiniIndicator";
import BottomNav from "@/components/tierup/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TierUp — a focus timer that bakes cakes",
  description: "Set an intention, focus, and grow a beautiful cake.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <header
            className="border-b bg-white/50 backdrop-blur"
            style={{ borderColor: 'var(--border)' }}
          >
            <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
              <Link
                href="/"
                className="text-2xl font-medium tracking-tight text-stone-900"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                TierUp
              </Link>
              <ul className="flex items-center gap-1 text-sm text-stone-600 sm:gap-3">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/tasks">Tasks</NavLink>
                <NavLink href="/focus">Focus</NavLink>
                <NavLink href="/calendar">Calendar</NavLink>
                <NavLink href="/kitchen">Kitchen</NavLink>
                <li className="hidden sm:inline-block">
                  <Link
                    href="/playground"
                    className="rounded-full px-3 py-1.5 text-stone-400 hover:text-stone-600"
                  >
                    Playground
                  </Link>
                </li>
                <li className="hidden sm:inline-block">
                  <Link
                    href="/health"
                    className="rounded-full px-3 py-1.5 text-stone-400 hover:text-stone-600"
                  >
                    Health
                  </Link>
                </li>
              </ul>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-8 sm:px-8 sm:py-14 md:pb-14">
            {children}
          </main>
          <FocusMiniIndicator />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="rounded-full px-3 py-1.5 transition-colors hover:bg-stone-100 hover:text-stone-900"
      >
        {children}
      </Link>
    </li>
  );
}
