"use client";

import { useState, useEffect } from "react";

function getNextMergeTime(): Date {
  const now = new Date();
  const target = new Date(now);

  // Set to 19:00:00 UTC today
  target.setUTCHours(19, 0, 0, 0);

  // If we've already passed 19:00 UTC today, use 19:00 UTC tomorrow
  if (now.getTime() >= target.getTime()) {
    target.setUTCDate(target.getUTCDate() + 1);
  }

  return target;
}

function getTimeRemaining(target: Date): {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
} {
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());

  const milliseconds = diff % 1000;
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / 1000 / 60 / 60) % 24);

  return { hours, minutes, seconds, milliseconds };
}

function pad(n: number, count: number = 2): string {
  return n.toString().padStart(count, "0");
}

export function Countdown() {
  const [target, setTarget] = useState(() => getNextMergeTime());
  const [time, setTime] = useState(() => getTimeRemaining(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      const now = new Date();
      // If we've passed the target time, recalculate for the next day
      if (now.getTime() >= target.getTime()) {
        const newTarget = getNextMergeTime();
        setTarget(newTarget);
        setTime(getTimeRemaining(newTarget));
      } else {
        setTime(getTimeRemaining(target));
      }
    }, 53); // just a prime number

    return () => clearInterval(interval);
  }, [target]);

  if (!mounted) {
    return (
      <div>
        <div>NEXT MERGE COUNTDOWN</div>
        <div>
          -- DAYS : -- HOURS : -- MINS : -- SECS
        </div>
        <div>&nbsp;</div>
      </div>
    );
  }

  return (
    <div>
      <div>NEXT MERGE COUNTDOWN</div>
      <div>
        {pad(time.hours)} HOURS : {pad(time.minutes)} MINS : {pad(time.seconds)} SECS : {pad(time.milliseconds, 3)} MS
      </div>
      <div>&nbsp;</div>
    </div>
  );
}
