"use client";

import { useState, useEffect } from "react";

function getNextMergeTime(): Date {
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(19, 0, 0, 0);
  if (now.getTime() >= target.getTime()) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  return target;
}

function getTimeRemaining(target: Date) {
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor(diff / 1000 / 60 / 60);
  return { hours, minutes, seconds };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function Countdown() {
  const [target, setTarget] = useState(() => getNextMergeTime());
  const [time, setTime] = useState(() => getTimeRemaining(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const display = mounted
    ? `${pad(time.hours)} HOURS : ${pad(time.minutes)} MINUTES : ${pad(time.seconds)} SECONDS`
    : "-- HOURS : -- MINUTES : -- SECONDS";

  return (
    <div className="np-countdown-wrap">
      <div className="np-countdown-label">PRESS DEADLINE</div>
      <div className="np-countdown-time">{display}</div>
      <div className="np-countdown-sub">Cast your ballot before the presses roll!</div>
    </div>
  );
}
