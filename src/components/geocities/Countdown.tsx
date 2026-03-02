"use client";

import { useCountdown, pad } from "@/hooks/useCountdown";

export function Countdown() {
  const { hours, minutes, seconds, milliseconds, mounted } = useCountdown(53);

  if (!mounted) {
    return (
      <table border={5} cellPadding={0} cellSpacing={0} className="countdown-table">
        <tbody>
          <tr>
            <td className="countdown-header-cell">
              <div className="countdown-header">
                {/* @ts-expect-error marquee is deprecated but used for retro styling */}
                <marquee behavior="alternate" scrollamount="8">
                  <span className="sparkle-pulse">&#128293;</span> <b>&#9200; NEXT MERGE COUNTDOWN &#9200;</b> <span className="sparkle-pulse sparkle-delay-2">&#128293;</span>
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
                      <div className="countdown-digit-value"><b>--</b></div>
                      <div className="countdown-digit-label"><b>DAYS</b></div>
                    </td>
                    <td className="countdown-separator-cell">
                      <span className="countdown-separator sparkle-pulse">&#11088;</span>
                    </td>
                    <td className="countdown-digit-cell">
                      <div className="countdown-digit-value"><b>--</b></div>
                      <div className="countdown-digit-label"><b>HOURS</b></div>
                    </td>
                    <td className="countdown-separator-cell">
                      <span className="countdown-separator sparkle-pulse sparkle-delay-2">&#11088;</span>
                    </td>
                    <td className="countdown-digit-cell">
                      <div className="countdown-digit-value"><b>--</b></div>
                      <div className="countdown-digit-label"><b>MINS</b></div>
                    </td>
                    <td className="countdown-separator-cell">
                      <span className="countdown-separator sparkle-pulse">&#11088;</span>
                    </td>
                    <td className="countdown-digit-cell">
                      <div className="countdown-digit-value"><b>--</b></div>
                      <div className="countdown-digit-label"><b>SECS</b></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td className="countdown-footer-cell">
              <div className="countdown-footer"><b>HURRY! TIME IS RUNNING OUT!</b></div>
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
                <span className="sparkle-pulse">&#128293;</span> <b>&#9200; NEXT MERGE COUNTDOWN &#9200;</b> <span className="sparkle-pulse sparkle-delay-2">&#128293;</span>
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
                    <div className="countdown-digit-value blink-countdown"><b>{pad(hours)}</b></div>
                    <div className="countdown-digit-label"><b>HOURS</b></div>
                  </td>
                  <td className="countdown-separator-cell">
                    <span className="countdown-separator sparkle-pulse">&#11088;</span>
                  </td>
                  <td className="countdown-digit-cell">
                    <div className="countdown-digit-value blink-countdown"><b>{pad(minutes)}</b></div>
                    <div className="countdown-digit-label"><b>MINS</b></div>
                  </td>
                  <td className="countdown-separator-cell">
                    <span className="countdown-separator sparkle-pulse sparkle-delay-2">&#11088;</span>
                  </td>
                  <td className="countdown-digit-cell">
                    <div className="countdown-digit-value blink-countdown"><b>{pad(seconds)}</b></div>
                    <div className="countdown-digit-label"><b>SECS</b></div>
                  </td>
                  <td className="countdown-separator-cell">
                    <span className="countdown-separator sparkle-pulse">&#11088;</span>
                  </td>
                  <td className="countdown-digit-cell">
                    <div className="countdown-digit-value blink-countdown"><b>{pad(milliseconds, 3)}</b></div>
                    <div className="countdown-digit-label"><b>MILLISECONDS</b></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td className="countdown-footer-cell">
            <div className="countdown-footer"><b>HURRY! TIME IS RUNNING OUT!</b></div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
