import { Cat } from "@/components/Cat";
import { Clippy } from "@/components/ascii/Clippy";
import "./ascii.css";
import "./gta-radio.css";

export default function AsciiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container">
      {children}
      <Cat />
      <Clippy />
    </div>
  );
}
