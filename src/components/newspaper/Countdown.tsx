"use client";

import { useCountdown, pad } from "@/hooks/useCountdown";

export function Countdown() {
  const { hours, minutes, seconds, mounted } = useCountdown();

  const display = mounted
    ? `${pad(hours)} HOURS : ${pad(minutes)} MINUTES : ${pad(seconds)} SECONDS`
    : "-- HOURS : -- MINUTES : -- SECONDS";

  return (
    <div className="np-countdown-wrap">
      <div className="np-countdown-label">PRESS DEADLINE</div>
      <div className="np-countdown-time">{display}</div>
      <div className="np-countdown-sub">Cast your ballot before the presses roll!</div>
    </div>
  );
}
