import type { Metadata } from "next";
import { Cat } from "@/components/Cat";
import "./globals.css";
import { Clippy } from "@/components/Clippy";
import { Fartscroll } from "@/components/Fartscroll";

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
        <div className="container">
          {children}
          <Cat />
          <Clippy />
          <Fartscroll />
        </div>
      </body>
    </html>
  );
}
