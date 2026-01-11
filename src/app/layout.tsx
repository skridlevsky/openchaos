import type { Metadata } from "next";
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

const chaoticEmojis = [
  "🎯", "🎲", "⚡", "🔥", "💥", "🎪", "🎭", "🎨", "🚀", "⭐", "💫", "🌪️", 
  "🎊", "🎉", "🎈", "💩", "🤖", "🎮", "🧪", "🎰", "💻", "⌨️", "🐛", "🦄", 
  "👾", "🌀", "💎", "🎱", "🔮"
];

function getChaoticEmoji(): string {
  const emoji = chaoticEmojis[Math.floor(Math.random() * chaoticEmojis.length)];
  return `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "OpenChaos.dev",
    description: "A self-evolving open source project. Every week, the community votes on PRs, and the winner gets merged.",
    icons: {
      icon: getChaoticEmoji(),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
