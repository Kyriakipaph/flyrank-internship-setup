import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import FocusMiniIndicator from "@/components/tierup/FocusMiniIndicator";

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
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TierUp",
  description: "A focus timer that grows a cake while you work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <header className="border-b border-stone-200/70 bg-white/60 backdrop-blur">
            <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
              <Link
                href="/"
                className="text-2xl font-semibold tracking-tight text-stone-900"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                TierUp
              </Link>
              <ul className="flex items-center gap-1 text-sm text-stone-600 sm:gap-2">
                <li>
                  <Link
                    href="/"
                    className="rounded-full px-3 py-1.5 hover:bg-stone-100 hover:text-stone-900"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tasks"
                    className="rounded-full px-3 py-1.5 hover:bg-stone-100 hover:text-stone-900"
                  >
                    Tasks
                  </Link>
                </li>
                <li>
                  <Link
                    href="/focus"
                    className="rounded-full px-3 py-1.5 hover:bg-stone-100 hover:text-stone-900"
                  >
                    Focus
                  </Link>
                </li>
                <li>
                  <Link
                    href="/kitchen"
                    className="rounded-full px-3 py-1.5 hover:bg-stone-100 hover:text-stone-900"
                  >
                    Kitchen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/playground"
                    className="hidden rounded-full px-3 py-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 sm:inline-block"
                  >
                    Playground
                  </Link>
                </li>
                <li>
                  <Link
                    href="/health"
                    className="hidden rounded-full px-3 py-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 sm:inline-block"
                  >
                    Health
                  </Link>
                </li>
              </ul>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-8 sm:py-12">
            {children}
          </main>
          <FocusMiniIndicator />
        </Providers>
      </body>
    </html>
  );
}
