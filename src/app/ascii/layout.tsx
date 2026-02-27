"use client";

import { Cat } from "@/components/Cat";
import { Clippy } from "@/components/ascii/Clippy";
import { MidiPlayer } from "@/components/MidiPlayer";
import { VoteTracker } from "@/components/VoteTracker";
import { useAchievements } from "@/hooks/useAchievements";
import { useEffect } from "react";
import "./ascii.css";
import "./gta-radio.css";

export default function AsciiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { trackThemeVisit } = useAchievements();

  useEffect(() => {
    trackThemeVisit("ascii");
  }, [trackThemeVisit]);

  return (
    <div className="container">
      <VoteTracker />
      {children}
      <Cat />
      <Clippy />
      <MidiPlayer />
    </div>
  );
}
