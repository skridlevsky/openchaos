"use client";

import { useState, useEffect } from "react";

function getNextMergeTime(): Date {
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(19, 0, 0, 0);
  // Merge happens weekly on Saturday (day 6) at 19:00 UTC
  const day = target.getUTCDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  target.setUTCDate(target.getUTCDate() + daysUntilSaturday);
  if (now.getTime() >= target.getTime()) {
    target.setUTCDate(target.getUTCDate() + 7);
  }
  return target;
}

function getTimeRemaining(target: Date) {
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());
  const milliseconds = diff % 1000;
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);
  return { days, hours, minutes, seconds, milliseconds };
}

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  mounted: boolean;
}

export function useCountdown(intervalMs: number = 1000): CountdownTime {
  const [target, setTarget] = useState(() => getNextMergeTime());
  const [time, setTime] = useState(() => getTimeRemaining(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mounted flag must trigger re-render from effect
    setMounted(true);
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getTime() >= target.getTime()) {
        const newTarget = getNextMergeTime();
        setTarget(newTarget);
        setTime(getTimeRemaining(newTarget));
      } else {
        setTime(getTimeRemaining(target));
      }
    }, intervalMs);
    return () => clearInterval(interval);
  }, [target, intervalMs]);

  return { ...time, mounted };
}

export function pad(n: number, width: number = 2): string {
  return n.toString().padStart(width, "0");
}
