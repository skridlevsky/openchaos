"use client";

import { useEffect, useState } from "react";

interface CursorPoint {
  id: number;
  x: number;
  y: number;
}

export function CursorTrail() {
  const [cursors, setCursors] = useState<CursorPoint[]>([]);
  const [emoji, setEmoji] = useState("·");

  useEffect(() => {
    let cursorId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const newCursor: CursorPoint = {
        id: cursorId++,
        x: e.clientX,
        y: e.clientY
      };

      setCursors((prev) => [...prev, newCursor]);

      setTimeout(() => {
        setCursors((prev) => prev.filter((c) => c.id !== newCursor.id));
      }, 500);
    };

    let throttleTimer: NodeJS.Timeout | null = null;
    const throttledMouseMove = (e: MouseEvent) => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        handleMouseMove(e);
        throttleTimer = null;
      }, 80);
    };

    window.addEventListener("mousemove", throttledMouseMove);

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, []);

  useEffect(() => {
    const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let pos = 0;

    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === code[pos] || e.key === code[pos]) {
        pos++;
        if (pos === code.length) {
          setEmoji("🔫");
          pos = 0;
        }
      } else {
        pos = 0;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div style={{ pointerEvents: "none", position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999 }}>
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className="cursor-trail-emoji"
          style={{
            position: "absolute",
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-50%, -50%)",
            fontSize: "12px",
            userSelect: "none",
            color: "#2a5db0",
            opacity: 0.4,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
}
