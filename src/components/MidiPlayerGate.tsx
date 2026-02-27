"use client";

import { usePathname } from "next/navigation";
import { MidiPlayer } from "@/components/MidiPlayer";

export function MidiPlayerGate() {
  const pathname = usePathname();
  if (pathname === "/museum") return null;
  return <MidiPlayer />;
}
