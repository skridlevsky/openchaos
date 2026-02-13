"use client";

import Script from "next/script";
import { useEffect, useState, useRef } from "react";

declare global {
  interface Window {
    fartscroll?: {
      (pixels: number): void;
      play: (position?: number) => void;
    };
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
  const lastOffsetRef = useRef(0);
  const scrollHandlerRef = useRef<((e: Event) => void) | null>(null);

  useEffect(() => {
    if (!scriptLoaded) return;

    // Check if there is this weird IE6 layout (which has custom scroll container)
    const ie6ContentArea = document.querySelector('.ie6-content-area');

    // Initialize fartscroll on first click/touch/keydown
    const handleInteraction = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      // Remove interaction listeners after initialization
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);

      if (ie6ContentArea) {
        // IE6 layout: manually monitor the scroll position and play farts
        const playFartOnScroll = (e: Event) => {
          const scrollElement = e.currentTarget as HTMLElement;
          const scrollOffset = Math.floor(scrollElement.scrollTop / FARTSCROLL_TRIGGER_DISTANCE_PX);

          if (lastOffsetRef.current !== scrollOffset) {
            // Call the exposed play function from fartscroll.js
            if (window.fartscroll?.play) {
              try {
                window.fartscroll.play();
              } catch {
                // Silently catch any errors
              }
            }
            lastOffsetRef.current = scrollOffset;
          }
        };

        scrollHandlerRef.current = playFartOnScroll;
        ie6ContentArea.addEventListener('scroll', playFartOnScroll, false);
      } else {
        // Normal layout: use the built-in fartscroll.js hopefully someone will get rid of this weird IE6 thing
        try {
          if (window.fartscroll) {
            window.fartscroll(FARTSCROLL_TRIGGER_DISTANCE_PX);
          }
        } catch (error) {
          // Silently catch any errors
        }
      }
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);

      // Clean up scroll listener for IE6 layout
      if (ie6ContentArea && scrollHandlerRef.current) {
        ie6ContentArea.removeEventListener('scroll', scrollHandlerRef.current);
      }
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
