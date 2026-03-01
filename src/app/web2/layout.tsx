import { MidiPlayer } from "@/components/MidiPlayer";
import "./web2.css";
import "./gta-radio.css";

export default function Web2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <MidiPlayer />
    </>
  );
}
