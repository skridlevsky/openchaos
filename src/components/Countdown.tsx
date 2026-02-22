"use client";

import { Fragment } from "react";
import { useCountdown, pad } from "@/hooks/useCountdown";

function CountdownDigit({ value, label }: { value: string; label: string }) {
  return (
    <div className="countdown-digit-box">
      <div className="countdown-digit-value">{value}</div>
      <div className="countdown-digit-label">{label}</div>
    </div>
  );
}

export function Countdown() {
  const { days, hours, minutes, seconds, mounted } = useCountdown();

  const digits: { value: string; label: string }[] = mounted
    ? [
        { value: String(days), label: "Days" },
        { value: pad(hours), label: "Hours" },
        { value: pad(minutes), label: "Mins" },
        { value: pad(seconds), label: "Secs" },
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
        <div className="countdown-header">Next Merge Countdown</div>
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
        <div className="countdown-footer">Vote now — time is running out!</div>
      </div>
    </div>
  );
}
