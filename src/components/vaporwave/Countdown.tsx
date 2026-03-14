"use client";

import { useCountdown, pad } from "@/hooks/useCountdown";

export function Countdown() {
  const { days, hours, minutes, seconds, mounted } = useCountdown();

  return (
    <div className="vw-countdown">
      <div className="vw-countdown-label">Next Merge Countdown</div>
      <div className="vw-countdown-time">
        {mounted ? (
          <>
            {days > 0 && <>{pad(days)}<span className="vw-countdown-sep">d</span></>}
            {pad(hours)}<span className="vw-countdown-sep">h</span>
            {pad(minutes)}<span className="vw-countdown-sep">m</span>
            {pad(seconds)}<span className="vw-countdown-sep">s</span>
          </>
        ) : (
          "--h --m --s"
        )}
      </div>
    </div>
  );
}
