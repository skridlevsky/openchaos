"use client";

import { useState, useEffect, useId } from "react";

function getNextSunday9UTC(): Date {
  const now = new Date();
  const target = new Date(now);

  const daysUntilSunday = (7 - now.getUTCDay()) % 7;
  target.setUTCDate(now.getUTCDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
  target.setUTCHours(9, 0, 0, 0);

  if (now.getUTCDay() === 0 && now.getUTCHours() < 9) {
    target.setUTCDate(now.getUTCDate());
  }

  return target;
}

function getTimeRemaining(target: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
} {
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);

  return { days, hours, minutes, seconds, totalMs: diff };
}

interface DoomsdayClockProps {
  onMidnight?: () => void;
}

export function DoomsdayClock({ onMidnight }: DoomsdayClockProps) {
  const id = useId();
  const glowId = `${id}-glow`;
  const strongGlowId = `${id}-strong-glow`;
  const [target] = useState(() => getNextSunday9UTC());
  const [time, setTime] = useState(() => getTimeRemaining(target));
  const [mounted, setMounted] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      const newTime = getTimeRemaining(target);
      setTime(newTime);

      if (newTime.totalMs === 0 && !hasTriggered) {
        setHasTriggered(true);
        onMidnight?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [target, onMidnight, hasTriggered]);

  // Calculate clock hand positions
  // Hour hand: 12 hours = full rotation, pointing to 12 means 0 degrees
  // We want hands to approach 12 (midnight) as time runs out
  const totalHoursRemaining = time.days * 24 + time.hours;
  const hourAngle = 360 - ((totalHoursRemaining % 12) / 12) * 360;
  const minuteAngle = 360 - (time.minutes / 60) * 360;
  const secondAngle = 360 - (time.seconds / 60) * 360;

  // Determine intensity level based on time remaining
  const totalMinutesRemaining = totalHoursRemaining * 60 + time.minutes;
  const isUrgent = totalHoursRemaining < 6;
  const isDangerZone = totalHoursRemaining < 1;
  const isCritical = totalMinutesRemaining < 10;
  const isImminent = totalMinutesRemaining < 1;

  if (!mounted) {
    return (
      <div className="doomsday-container">
        <div className="doomsday-clock">
          <svg viewBox="0 0 200 200" className="clock-face" role="img" aria-labelledby={`${id}-title`}>
            <title id={`${id}-title`}>Doomsday clock loading</title>
            <circle cx="100" cy="100" r="95" className="clock-outer" />
            <circle cx="100" cy="100" r="85" className="clock-inner" />
          </svg>
        </div>
        <div className="doomsday-text">-- DAYS</div>
        <div className="doomsday-subtext">until the merge</div>
      </div>
    );
  }

  const containerClasses = [
    "doomsday-container",
    isUrgent && "urgent",
    isDangerZone && "danger-zone",
    isCritical && "critical",
    isImminent && "imminent",
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      <div className="doomsday-clock">
        <svg viewBox="0 0 200 200" className="clock-face" role="img" aria-labelledby={`${id}-clock-title`}>
          <title id={`${id}-clock-title`}>Doomsday clock countdown</title>
          {/* Glow filter */}
          <defs>
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={strongGlowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer ring */}
          <circle cx="100" cy="100" r="95" className="clock-outer" filter={`url(#${glowId})`} />

          {/* Inner face */}
          <circle cx="100" cy="100" r="85" className="clock-inner" />

          {/* Tick marks */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const isMainTick = i === 0; // 12 o'clock
            const innerR = isMainTick ? 65 : 72;
            const outerR = 82;
            return (
              <line
                key={`tick-${i}`}
                x1={100 + innerR * Math.cos(angle)}
                y1={100 + innerR * Math.sin(angle)}
                x2={100 + outerR * Math.cos(angle)}
                y2={100 + outerR * Math.sin(angle)}
                className={`tick-mark ${isMainTick ? "midnight-tick" : ""}`}
                filter={isMainTick ? `url(#${strongGlowId})` : undefined}
              />
            );
          })}

          {/* 12 label (MIDNIGHT) */}
          <text x="100" y="35" className="midnight-label" textAnchor="middle">
            12
          </text>

          {/* Hour hand */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="50"
            className="hour-hand"
            transform={`rotate(${hourAngle} 100 100)`}
            filter={`url(#${glowId})`}
          />

          {/* Minute hand */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="35"
            className="minute-hand"
            transform={`rotate(${minuteAngle} 100 100)`}
            filter={`url(#${glowId})`}
          />

          {/* Second hand */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            className="second-hand"
            transform={`rotate(${secondAngle} 100 100)`}
          />

          {/* Center dot */}
          <circle cx="100" cy="100" r="5" className="center-dot" filter={`url(#${glowId})`} />
        </svg>
      </div>

      <div className="doomsday-text">
        {time.days > 0
          ? `${time.days} ${time.days === 1 ? "DAY" : "DAYS"}`
          : time.hours > 0
            ? `${time.hours} ${time.hours === 1 ? "HOUR" : "HOURS"}`
            : `${time.minutes} ${time.minutes === 1 ? "MINUTE" : "MINUTES"}`}
      </div>
      <div className="doomsday-subtext">until the merge</div>
    </div>
  );
}
