import { MidiPlayer } from "@/components/MidiPlayer";
import { ThemePathProvider } from "@/context/ThemePathContext";
import { WelcomePopup } from "@/components/WelcomePopup";
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
      <WelcomePopup variant="web2" />
    </ThemePathProvider>
  );
}
