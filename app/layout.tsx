import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlightSearch - Find Your Perfect Flight",
  description:
    "Compare flights from multiple airlines and book with confidence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary  >
          <nav className="bg-cyan-500 text-white p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold">FlightSearch</h1>
              <div className="space-x-4">
                <Link href="/" className="hover:text-cyan-100 transition-colors">
                  Search
                </Link>
              </div>
            </div>
          </nav>
          <main className="min-h-screen bg-gray-50">{children}</main>
          <footer className="bg-gray-800 text-white p-8 text-center">
            <p>© 2025 FlightSearch. Built with Next.js 14</p>
          </footer>
        </ErrorBoundary>
      </body>
    </html>
  );
}
