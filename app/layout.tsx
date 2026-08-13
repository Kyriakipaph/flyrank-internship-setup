import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TierUp",
  description: "A focus timer that grows a cake while you work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              TierUp
            </Link>
            <ul className="flex items-center gap-2 text-sm sm:gap-6">
              <li>
                <Link href="/" className="hover:underline">
                  Focus
                </Link>
              </li>
              <li>
                <Link href="/kitchen" className="hover:underline">
                  Kitchen
                </Link>
              </li>
              <li>
                <Link href="/tasks" className="hover:underline">
                  Tasks
                </Link>
              </li>
              <li>
                <Link
                  href="/health"
                  className="text-zinc-500 hover:underline dark:text-zinc-400"
                >
                  Health
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
