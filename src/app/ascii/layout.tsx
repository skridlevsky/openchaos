import { Cat } from "@/components/Cat";
import { Clippy } from "@/components/ascii/Clippy";
import { MidiPlayer } from "@/components/MidiPlayer";
import { ThemePathProvider } from "@/context/ThemePathContext";
import "./ascii.css";
import "./gta-radio.css";

export default function AsciiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemePathProvider themePath="ascii">
      <div className="container">
        {children}
        <Cat />
        <Clippy />
        <MidiPlayer />
      </div>
    </ThemePathProvider>
  );
}
