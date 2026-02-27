"use client";

import { useEffect } from "react";
import { useAchievements } from "@/hooks/useAchievements";

export function VoteTracker() {
  const { trackVote } = useAchievements();

  useEffect(() => {
    // Listen for vote events
    const handleVoteSuccess = () => {
      trackVote();
    };

    window.addEventListener("vote_success", handleVoteSuccess);
    return () => window.removeEventListener("vote_success", handleVoteSuccess);
  }, [trackVote]);

  return null;
}
