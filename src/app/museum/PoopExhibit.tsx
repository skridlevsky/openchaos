"use client";

declare global {
  interface Window {
    fartscroll?: { play: (position?: number) => void };
  }
}

export function PoopExhibit() {
  const playFart = () => {
    try {
      window.fartscroll?.play();
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="museum-artwork-frame museum-artwork-frame-emoji museum-emoji-tappable"
      role="button"
      tabIndex={0}
      onClick={playFart}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          playFart();
        }
      }}
      aria-label="Play sound"
    >
      <span className="museum-emoji" aria-hidden>💩</span>
    </div>
  );
}
