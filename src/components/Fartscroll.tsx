"use client";

import Script from "next/script";
import { useEffect, useState, useRef } from "react";

declare global {
  interface Window {
    fartscroll?: (pixels: number) => void;
  }
}

// configure after how many scrolled pixels fart sounds will play
const FARTSCROLL_TRIGGER_DISTANCE_PX = 400;

/**
 * Farts on scroll
 *
 * The user must interact with the page first before farts will start, due to the autoplay policy: https://developer.chrome.com/blog/autoplay
 */
export function Fartscroll() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!scriptLoaded) return;

    // Initialize fartscroll on first click/touch/keydown
    const handleInteraction = () => {
      if (initializedRef.current || !window.fartscroll) return;

      try {
        window.fartscroll(FARTSCROLL_TRIGGER_DISTANCE_PX);
        initializedRef.current = true;

        // Remove click listeners after initialization
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("touchstart", handleInteraction);
        window.removeEventListener("keydown", handleInteraction);
      } catch (error) {
        // Silently catch any errors
      }
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [scriptLoaded]);

  return (
    <Script
      src="/fartscroll.js"
      strategy="afterInteractive"
      onLoad={() => {
        setScriptLoaded(true);
      }}
    />
  );
}
