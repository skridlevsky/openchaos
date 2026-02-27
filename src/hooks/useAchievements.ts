"use client";

import { useState, useEffect } from "react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

const ACHIEVEMENTS: Omit<Achievement, "unlocked" | "unlockedAt">[] = [
  {
    id: "first_visit",
    title: "First Visit",
    description: "Welcome to OpenChaos!",
    icon: "🌟",
  },
  {
    id: "first_vote",
    title: "Democracy Rookie",
    description: "Cast your first vote",
    icon: "🗳️",
  },
  {
    id: "vote_streak_5",
    title: "Active Voter",
    description: "Cast 5 votes",
    icon: "🔥",
  },
  {
    id: "vote_streak_10",
    title: "Vote Champion",
    description: "Cast 10 votes",
    icon: "🏆",
  },
  {
    id: "vote_streak_25",
    title: "Democracy Hero",
    description: "Cast 25 votes",
    icon: "⭐",
  },
  {
    id: "chaos_explorer",
    title: "Chaos Explorer",
    description: "Visit all 3 themes",
    icon: "🗺️",
  },
  {
    id: "museum_visitor",
    title: "Cultured Individual",
    description: "Visit the Museum",
    icon: "🎨",
  },
  {
    id: "night_owl",
    title: "Night Owl",
    description: "Visit after midnight",
    icon: "🦉",
  },
];

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadAchievements();
    checkAutoUnlockAchievements();
  }, []);

  function loadAchievements() {
    try {
      const stored = localStorage.getItem("openchaos_achievements");
      const unlocked = stored ? JSON.parse(stored) : {};
      
      const loadedAchievements = ACHIEVEMENTS.map((achievement) => ({
        ...achievement,
        unlocked: unlocked[achievement.id]?.unlocked || false,
        unlockedAt: unlocked[achievement.id]?.unlockedAt,
      }));
      
      setAchievements(loadedAchievements);
    } catch (e) {
      console.debug("Failed to load achievements:", e);
      setAchievements(
        ACHIEVEMENTS.map((achievement) => ({ ...achievement, unlocked: false }))
      );
    }
  }

  function checkAutoUnlockAchievements() {
    // First visit
    unlockAchievement("first_visit");

    // Night owl (after midnight)
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      unlockAchievement("night_owl");
    }

    // Check visited themes
    checkThemeExplorer();
  }

  function checkThemeExplorer() {
    try {
      const visitedThemes = JSON.parse(
        localStorage.getItem("visited_themes") || "[]"
      );
      if (visitedThemes.length >= 3) {
        unlockAchievement("chaos_explorer");
      }
    } catch (e) {
      console.debug("Failed to check theme explorer:", e);
    }
  }

  function unlockAchievement(achievementId: string) {
    try {
      const stored = localStorage.getItem("openchaos_achievements");
      const unlocked = stored ? JSON.parse(stored) : {};

      if (!unlocked[achievementId]) {
        unlocked[achievementId] = {
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        };
        localStorage.setItem("openchaos_achievements", JSON.stringify(unlocked));
        
        setAchievements((prev: Achievement[]) =>
          prev.map((achievement: Achievement) =>
            achievement.id === achievementId
              ? { ...achievement, unlocked: true, unlockedAt: unlocked[achievementId].unlockedAt }
              : achievement
          )
        );

        // Show a celebration notification (optional)
        const achievement = ACHIEVEMENTS.find((a: typeof ACHIEVEMENTS[number]) => a.id === achievementId);
        if (achievement) {
          console.log(`🎉 Achievement Unlocked: ${achievement.title}!`);
        }
      }
    } catch (e) {
      console.debug("Failed to unlock achievement:", e);
    }
  }

  function trackVote() {
    try {
      const voteCount = parseInt(localStorage.getItem("total_votes") || "0", 10);
      const newVoteCount = voteCount + 1;
      localStorage.setItem("total_votes", newVoteCount.toString());

      if (newVoteCount === 1) {
        unlockAchievement("first_vote");
      } else if (newVoteCount === 5) {
        unlockAchievement("vote_streak_5");
      } else if (newVoteCount === 10) {
        unlockAchievement("vote_streak_10");
      } else if (newVoteCount === 25) {
        unlockAchievement("vote_streak_25");
      }
    } catch (e) {
      console.debug("Failed to track vote:", e);
    }
  }

  function trackThemeVisit(theme: string) {
    try {
      const visitedThemes = JSON.parse(
        localStorage.getItem("visited_themes") || "[]"
      );
      if (!visitedThemes.includes(theme)) {
        visitedThemes.push(theme);
        localStorage.setItem("visited_themes", JSON.stringify(visitedThemes));
        if (visitedThemes.length >= 3) {
          unlockAchievement("chaos_explorer");
        }
      }
    } catch (e) {
      console.debug("Failed to track theme visit:", e);
    }
  }

  function trackMuseumVisit() {
    unlockAchievement("museum_visitor");
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return {
    achievements,
    unlockedCount,
    totalCount,
    unlockAchievement,
    trackVote,
    trackThemeVisit,
    trackMuseumVisit,
  };
}
