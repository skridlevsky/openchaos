import type { Metadata } from "next";
import "./globals.css";
import "./retro.css";
import { BSOD } from "../components/BSOD";

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
        <BSOD />
        {children}
      </body>
    </html>
  );
}
