import { MidiPlayer } from "@/components/MidiPlayer";
import { ThemePathProvider } from "@/context/ThemePathContext";
import "./web2.css";
import "./gta-radio.css";

export default function Web2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemePathProvider themePath="web2">
      {children}
      <MidiPlayer />
    </ThemePathProvider>
  );
}
