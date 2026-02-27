"use client";

import { useEffect } from "react";
import { useAchievements } from "@/hooks/useAchievements";

export function MuseumTracker() {
  const { trackMuseumVisit } = useAchievements();

  useEffect(() => {
    trackMuseumVisit();
  }, [trackMuseumVisit]);

  return null;
}
