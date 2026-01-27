import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cat } from "@/components/Cat";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./retro.css";

export const metadata: Metadata = {
  title: "OpenChaos.dev",
  description: "A self-evolving open source project. Vote on PRs. Winner gets merged every Sunday.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Cat />
        <Analytics />
      </body>
    </html>
  );
}
