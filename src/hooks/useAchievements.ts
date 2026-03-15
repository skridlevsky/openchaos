"use client";

import { useState, useEffect, useCallback } from 'react';
import type { UserStats, UserAchievement, Achievement } from '@/lib/achievements';
import { getInitialState, checkAchievements } from '@/lib/achievements';

const STORAGE_KEY = 'openchaos_achievements';

export function useAchievements() {
  const [stats, setStats] = useState<UserStats>(getInitialState());
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setStats(parsed.stats || getInitialState());
        setAchievements(parsed.achievements || []);
      }
    } catch (e) { console.error('Failed to load achievements:', e); }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized || typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, achievements })); } catch (e) { console.error('Failed to save achievements:', e); }
  }, [stats, achievements, initialized]);

  const checkNewAchievements = useCallback((newStats: UserStats) => {
    const newly = checkAchievements(newStats).filter(a => !achievements.find(e => e.id === a.id));
    if (newly.length > 0) {
      const now = new Date().toISOString();
      setAchievements(prev => [...prev, ...newly.map(a => ({ ...a, unlockedAt: now }))]);
      setNewlyUnlocked(newly);
      setTimeout(() => setNewlyUnlocked([]), 5000);
    }
  }, [achievements]);

  const recordVote = useCallback(() => {
    setStats(prev => {
      const today = new Date().toISOString().split('T')[0];
      const lastVote = prev.lastVoteDate;
      let newStreak = prev.votingStreak;
      let newDaysVoted = prev.daysVoted;
      if (lastVote) {
        const diffDays = Math.floor((new Date(today).getTime() - new Date(lastVote).getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) { } else if (diffDays === 1) { newStreak += 1; newDaysVoted += 1; } else { newStreak = 1; newDaysVoted += 1; }
      } else { newStreak = 1; newDaysVoted = 1; }
      const newStats = { ...prev, totalVotes: prev.totalVotes + 1, votingStreak: newStreak, daysVoted: newDaysVoted, lastVoteDate: today };
      checkNewAchievements(newStats);
      return newStats;
    });
  }, [checkNewAchievements]);

  const recordPR = useCallback((won: boolean = false) => {
    setStats(prev => {
      const newStats = { ...prev, prsSubmitted: prev.prsSubmitted + 1, prsWon: won ? prev.prsWon + 1 : prev.prsWon };
      checkNewAchievements(newStats);
      return newStats;
    });
  }, [checkNewAchievements]);

  const resetProgress = useCallback(() => {
    if (confirm('Reset all achievement progress?')) {
      setStats(getInitialState());
      setAchievements([]);
      setNewlyUnlocked([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { stats, achievements, newlyUnlocked, recordVote, recordPR, resetProgress };
}
