import type { Metadata } from "next";
import "./globals.css";
import { Fartscroll } from "@/components/Fartscroll";

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
    description: "A self-evolving open source project. Every day, the community votes on PRs, and the winner gets merged.",
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
      <body>
        {children}
        <Fartscroll />
      </body>
    </html>
  );
}
