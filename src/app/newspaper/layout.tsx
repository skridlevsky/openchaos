"use client";

import { VoteTracker } from "@/components/VoteTracker";
import { useAchievements } from "@/hooks/useAchievements";
import { useEffect } from "react";
import "./newspaper.css";

export default function NewspaperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { trackThemeVisit } = useAchievements();

  useEffect(() => {
    trackThemeVisit("newspaper");
  }, [trackThemeVisit]);

  return (
    <>
      <VoteTracker />
      {children}
    </>
  );
}
