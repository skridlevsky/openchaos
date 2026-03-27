"use client";

import { useCountdown, pad } from "@/hooks/useCountdown";

export function Countdown() {
  const { days, hours, minutes, seconds, mounted } = useCountdown();

  const display = mounted
    ? `${days} DAYS : ${pad(hours)} HOURS : ${pad(minutes)} MINUTES : ${pad(seconds)} SECONDS`
    : "-- DAYS : -- HOURS : -- MINUTES : -- SECONDS";

  return (
    <div className="np-countdown-wrap">
      <div className="np-countdown-label">PRESS DEADLINE</div>
      <div className="np-countdown-time">{display}</div>
      <div className="np-countdown-sub">Cast your ballot before the presses roll!</div>
    </div>
  );
}
