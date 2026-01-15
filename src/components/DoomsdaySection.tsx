"use client";

import { useState } from "react";
import { DoomsdayClock } from "./DoomsdayClock";
import { Explosion } from "./Explosion";
import { MergeReveal } from "./MergeReveal";
import type { PullRequest } from "@/lib/github";

interface DoomsdaySectionProps {
  winningPR: PullRequest | null;
}

export function DoomsdaySection({ winningPR }: DoomsdaySectionProps) {
  const [showExplosion, setShowExplosion] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [hasExploded, setHasExploded] = useState(false);

  const handleMidnight = () => {
    if (hasExploded) return;
    setHasExploded(true);
    setShowExplosion(true);
  };

  const handleExplosionComplete = () => {
    setShowExplosion(false);
    setShowReveal(true);
  };

  const handleDismiss = () => {
    setShowReveal(false);
    // Reset so it can trigger again next week
    setHasExploded(false);
  };

  return (
    <>
      <div className="mt-12">
        <DoomsdayClock onMidnight={handleMidnight} />
      </div>

      {showExplosion && <Explosion onComplete={handleExplosionComplete} />}

      {showReveal && (
        <MergeReveal pr={winningPR} onDismiss={handleDismiss} />
      )}
    </>
  );
}
