import type { Metadata } from "next";
import { Cat } from "@/components/Cat";
import "./globals.css";

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
        </div>
      </body>
    </html>
  );
}
