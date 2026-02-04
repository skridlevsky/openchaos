import type { Metadata } from "next";
import "./globals.css";
import "./retro.css";
import { pageCounter } from "@/lib/count/pageCounter";

export const metadata: Metadata = {
  title: "OpenChaos.dev",
  description: "A self-evolving open source project. Vote on PRs. Winner gets merged every Sunday.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  pageCounter.increment();
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
