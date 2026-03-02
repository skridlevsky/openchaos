import { Cat } from "@/components/geocities/Cat";
import { Clippy } from "@/components/geocities/Clippy";
import { MidiPlayer } from "@/components/geocities/MidiPlayer";
import { GeocitiesCursorTrail } from "@/components/geocities/GeocitiesCursorTrail";
import { GeocitiesStatusBar } from "@/components/geocities/GeocitiesStatusBar";
import { IE6BrowserChrome } from "@/components/geocities/IE6BrowserChrome";
import "./geocities.css";
import "./gta-radio.css";

export default function GeocitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="geocities-theme">
      <GeocitiesCursorTrail />
      <IE6BrowserChrome>
        {children}
        <MidiPlayer />
        <GeocitiesStatusBar />
      </IE6BrowserChrome>
      <Cat />
      <Clippy />
    </div>
  );
}
