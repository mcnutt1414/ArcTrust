import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcTrust — Trustworthy API providers on Arc",
  description:
    "Discover trustworthy API providers on Arc. Pay per use with Circle Nanopayments. Bulk-purchase volume = market-driven reputation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-arc-bg text-arc-text antialiased">{children}</body>
    </html>
  );
}
