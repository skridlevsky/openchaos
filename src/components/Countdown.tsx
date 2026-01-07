"use client";

import { useState, useEffect } from "react";
import { loadWasm } from "@/lib/wasm";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function Countdown() {
  const [time, setTime] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function init() {
      const wasm = await loadWasm();
      if (cancelled) {
        return;
      }

      const target = wasm.next_merge_timestamp(Date.now());

      const update = () => {
        const remaining = wasm.remaining_until(target, Date.now()) as {
          days: number;
          hours: number;
          minutes: number;
          seconds: number;
        };
        setTime(remaining);
      };

      update();
      setMounted(true);
      interval = setInterval(update, 1000);
    }

    void init();

    return () => {
      cancelled = true;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  if (!mounted) {
    return (
      <div className="text-center">
        <div className="text-5xl sm:text-7xl font-mono font-bold tracking-tight">
          --d --h --m --s
        </div>
        <p className="mt-4 text-zinc-500 text-lg">until next merge</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-5xl sm:text-7xl font-mono font-bold tracking-tight">
        {time?.days ?? 0}d {pad(time?.hours ?? 0)}h {pad(time?.minutes ?? 0)}m{" "}
        {pad(time?.seconds ?? 0)}s
      </div>
      <p className="mt-4 text-zinc-400 text-lg">until next merge</p>
    </div>
  );
}
