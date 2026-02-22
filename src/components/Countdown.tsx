"use client";

import { useState, useEffect, Fragment } from "react";

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
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);

  return { days, hours, minutes, seconds };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function CountdownDigit({ value, label }: { value: string; label: string }) {
  return (
    <div className="countdown-digit-box">
      <div className="countdown-digit-value">{value}</div>
      <div className="countdown-digit-label">{label}</div>
    </div>
  );
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
    }, 1000);

    return () => clearInterval(interval);
  }, [target]);

  const digits: { value: string; label: string }[] = mounted
    ? [
        { value: String(time.days), label: "Days" },
        { value: pad(time.hours), label: "Hours" },
        { value: pad(time.minutes), label: "Mins" },
        { value: pad(time.seconds), label: "Secs" },
      ]
    : [
        { value: "--", label: "Days" },
        { value: "--", label: "Hours" },
        { value: "--", label: "Mins" },
        { value: "--", label: "Secs" },
      ];

  return (
    <div className="countdown-container">
      <div className="countdown-header-bar">
        <div className="countdown-header">
          Next Merge Countdown
        </div>
      </div>
      <div className="countdown-digits-row">
        {digits.map((digit, i) => (
          <Fragment key={digit.label}>
            {i > 0 && <span className="countdown-separator">:</span>}
            <CountdownDigit value={digit.value} label={digit.label} />
          </Fragment>
        ))}
      </div>
      <div className="countdown-footer-bar">
        <div className="countdown-footer">
          Vote now — time is running out!
        </div>
      </div>
    </div>
  );
}
