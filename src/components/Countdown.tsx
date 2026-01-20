"use client";

import { useState, useEffect } from "react";

function getNextMergeTime(): Date {
  const now = new Date();
  const target = new Date(now);

  // Set to 9:00:00 UTC today
  target.setUTCHours(9, 0, 0, 0);

  // If we've already passed 9:00 UTC today, use 9:00 UTC tomorrow
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

  if (!mounted) {
    return (
      <table border={5} cellPadding={0} cellSpacing={0} className="countdown-table">
        <tbody>
          <tr>
            <td className="countdown-header-cell">
              <div className="countdown-header">
                {/* @ts-expect-error marquee is deprecated but used for retro styling */}
                <marquee behavior="alternate" scrollamount="8">
                  <span className="sparkle-pulse">🔥</span> <b>⏰ NEXT MERGE COUNTDOWN ⏰</b> <span className="sparkle-pulse sparkle-delay-2">🔥</span>
                {/* @ts-expect-error marquee is deprecated but used for retro styling */}
                </marquee>
              </div>
            </td>
          </tr>
          <tr>
            <td className="countdown-content-cell">
              <table width="100%" border={0} cellPadding={8} cellSpacing={10}>
                <tbody>
                  <tr>
                    <td className="countdown-digit-cell">
                      <div className="countdown-digit-value">
                        <b>--</b>
                      </div>
                      <div className="countdown-digit-label">
                        <b>DAYS</b>
                      </div>
                    </td>
                    <td className="countdown-separator-cell">
                      <span className="countdown-separator sparkle-pulse">⭐</span>
                    </td>
                    <td className="countdown-digit-cell">
                      <div className="countdown-digit-value">
                        <b>--</b>
                      </div>
                      <div className="countdown-digit-label">
                        <b>HOURS</b>
                      </div>
                    </td>
                    <td className="countdown-separator-cell">
                      <span className="countdown-separator sparkle-pulse sparkle-delay-2">⭐</span>
                    </td>
                    <td className="countdown-digit-cell">
                      <div className="countdown-digit-value">
                        <b>--</b>
                      </div>
                      <div className="countdown-digit-label">
                        <b>MINS</b>
                      </div>
                    </td>
                    <td className="countdown-separator-cell">
                      <span className="countdown-separator sparkle-pulse">⭐</span>
                    </td>
                    <td className="countdown-digit-cell">
                      <div className="countdown-digit-value">
                        <b>--</b>
                      </div>
                      <div className="countdown-digit-label">
                        <b>SECS</b>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td className="countdown-footer-cell">
              <div className="countdown-footer">
                <b>HURRY! TIME IS RUNNING OUT!</b>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table border={5} cellPadding={0} cellSpacing={0} className="countdown-table">
      <tbody>
        <tr>
          <td className="countdown-header-cell">
            <div className="countdown-header">
              {/* @ts-expect-error marquee is deprecated but used for retro styling */}
              <marquee behavior="alternate" scrollamount="8">
                <span className="sparkle-pulse">🔥</span> <b>⏰ NEXT MERGE COUNTDOWN ⏰</b> <span className="sparkle-pulse sparkle-delay-2">🔥</span>
              {/* @ts-expect-error marquee is deprecated but used for retro styling */}
              </marquee>
            </div>
          </td>
        </tr>
        <tr>
          <td className="countdown-content-cell">
            <table width="100%" border={0} cellPadding={8} cellSpacing={10}>
              <tbody>
                <tr>
                  <td className="countdown-digit-cell">
                    <div className="countdown-digit-value blink-countdown">
                      <b>{time.days}</b>
                    </div>
                    <div className="countdown-digit-label">
                      <b>DAYS</b>
                    </div>
                  </td>
                  <td className="countdown-separator-cell">
                    <span className="countdown-separator sparkle-pulse">⭐</span>
                  </td>
                  <td className="countdown-digit-cell">
                    <div className="countdown-digit-value blink-countdown">
                      <b>{pad(time.hours)}</b>
                    </div>
                    <div className="countdown-digit-label">
                      <b>HOURS</b>
                    </div>
                  </td>
                  <td className="countdown-separator-cell">
                    <span className="countdown-separator sparkle-pulse sparkle-delay-2">⭐</span>
                  </td>
                  <td className="countdown-digit-cell">
                    <div className="countdown-digit-value blink-countdown">
                      <b>{pad(time.minutes)}</b>
                    </div>
                    <div className="countdown-digit-label">
                      <b>MINS</b>
                    </div>
                  </td>
                  <td className="countdown-separator-cell">
                    <span className="countdown-separator sparkle-pulse">⭐</span>
                  </td>
                  <td className="countdown-digit-cell">
                    <div className="countdown-digit-value blink-countdown">
                      <b>{pad(time.seconds)}</b>
                    </div>
                    <div className="countdown-digit-label">
                      <b>SECS</b>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td className="countdown-footer-cell">
            <div className="countdown-footer">
              <b>HURRY! TIME IS RUNNING OUT!</b>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
