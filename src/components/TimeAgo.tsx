"use client";

import { useEffect, useMemo, useState } from "react";

interface TimeAgoProps {
  isoDate: string;
}

function formatRelativeTime(date: Date, rtf: Intl.RelativeTimeFormat) {
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  const sign = Math.sign(seconds);

  if (abs < 60) return rtf.format(sign * Math.round(abs), "second");
  if (abs < 3600) return rtf.format(sign * Math.round(abs / 60), "minute");
  if (abs < 86400) return rtf.format(sign * Math.round(abs / 3600), "hour");
  if (abs < 604800) return rtf.format(sign * Math.round(abs / 86400), "day");
  if (abs < 2629800) return rtf.format(sign * Math.round(abs / 604800), "week");
  if (abs < 31557600) return rtf.format(sign * Math.round(abs / 2629800), "month");
  return rtf.format(sign * Math.round(abs / 31557600), "year");
}

export function TimeAgo({ isoDate }: TimeAgoProps) {
  const date = useMemo(() => new Date(isoDate), [isoDate]);
  const locale = typeof navigator !== "undefined" ? navigator.language : "en";
  const rtf = useMemo(() => new Intl.RelativeTimeFormat(locale, { numeric: "auto" }), [locale]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const ageSeconds = Math.abs((Date.now() - date.getTime()) / 1000);
    // adaptive interval: more frequent for recent times
    const interval = ageSeconds < 3600 ? 10000 : ageSeconds < 86400 ? 60000 : 3600000;
    const id = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(id);
  }, [isoDate, date]);

  return <span>{formatRelativeTime(date, rtf)}</span>;
}

export default TimeAgo;
