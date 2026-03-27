"use client";

import { useCountdown, pad } from "@/hooks/useCountdown";

export function Countdown() {
  const { days, hours, minutes, seconds, milliseconds, mounted } = useCountdown(53);

  const display = mounted
    ? `${days} DAYS : ${pad(hours)} HOURS : ${pad(minutes)} MINS : ${pad(seconds)} SECS : ${pad(milliseconds, 3)} MS`
    : "-- DAYS : -- HOURS : -- MINS : -- SECS";

  return (
    <div>
      <div>NEXT MERGE COUNTDOWN</div>
      <div>{display}</div>
      <div>&nbsp;</div>
    </div>
  );
}
