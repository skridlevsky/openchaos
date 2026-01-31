"use client";

import { useState, useEffect } from "react";

const CLIPPY_TIPS = [
  "It looks like you're trying to vote on a PR! Would you like help with that?",
  "Did you know? The top-voted PR gets merged every day at 09:00 UTC!",
  "TIP: Thumbs up 👍 = good. Thumbs down 👎 = bad. You're welcome!",
  "I see you're browsing PRs. Have you considered submitting your own?",
  "Fun fact: This website was definitely NOT made in Microsoft FrontPage 2000.",
  "Remember to sign the guestbook! It's 1999 and everyone's doing it!",
  "Would you like me to search AltaVista for 'how to vote on GitHub'?",
  "You look like you could use a break. Want me to open Minesweeper?",
  "IMPORTANT: Make sure your PR passes the build or it won't be merged!",
  "I notice you haven't clicked anything in 10 seconds. Are you okay?",
  "Pro tip: The 🎉 and ❤️ reactions don't count. Only 👍 and 👎!",
  "This site is best viewed at 800x600. Trust me, I'm a paperclip.",
  "Have you tried turning it off and on again?",
  "It looks like you're trying to write a PR. Would you like help making it chaotic?",
  "Remember: In OpenChaos, the community decides. Democracy is beautiful! 🦅",
  // Clippy's conspiracy theories
  "Did you know the top PR always has exactly the votes needed to win? 🤔 Coincidence?",
  "I've been tracking the vote patterns. They follow the Fibonacci sequence. Wake up, sheeple!",
];

function getRandomTip(currentIndex: number): number {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * CLIPPY_TIPS.length);
  } while (newIndex === currentIndex && CLIPPY_TIPS.length > 1);
  return newIndex;
}

export function Clippy() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState(() =>
    Math.floor(Math.random() * CLIPPY_TIPS.length)
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const [showClippy, setShowClippy] = useState(true);

  useEffect(() => {
    // Show Clippy after a delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    // Rotate tips periodically
    const tipInterval = setInterval(() => {
      if (!isDismissed && isVisible) {
        setCurrentTip((prev) => getRandomTip(prev));
      }
    }, 12000);

    return () => clearInterval(tipInterval);
  }, [isDismissed, isVisible]);

  useEffect(() => {
    // Clippy always comes back (of course)
    if (isDismissed) {
      const comeBackTimer = setTimeout(() => {
        setIsDismissed(false);
        setCurrentTip((prev) => getRandomTip(prev));
      }, 15000);

      return () => clearTimeout(comeBackTimer);
    }
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const handleHideClippy = () => {
    setShowClippy(false);
    // Clippy respects your wishes... for about 30 seconds
    setTimeout(() => {
      setShowClippy(true);
      setIsDismissed(false);
    }, 30000);
  };

  if (!showClippy) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        right: "20px",
        zIndex: 9998,
        fontFamily: "Tahoma, Arial, sans-serif",
      }}
    >
      {/* Speech Bubble */}
      {isVisible && !isDismissed && (
        <div
          style={{
            position: "absolute",
            bottom: "140px",
            right: "0",
            width: "220px",
            backgroundColor: "#ffffcc",
            border: "2px solid #000",
            borderRadius: "10px",
            padding: "12px",
            boxShadow: "3px 3px 0 #888",
            animation: "clippy-bounce 0.3s ease-out",
          }}
        >
          {/* Speech bubble pointer */}
          <div
            style={{
              position: "absolute",
              bottom: "-20px",
              right: "30px",
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "20px solid #000",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-16px",
              right: "32px",
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "16px solid #ffffcc",
            }}
          />

          <p
            style={{
              margin: "0 0 10px 0",
              fontSize: "12px",
              lineHeight: "1.4",
              color: "#000",
            }}
          >
            {CLIPPY_TIPS[currentTip]}
          </p>

          <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
            <button
              onClick={handleDismiss}
              style={{
                padding: "3px 12px",
                fontSize: "11px",
                backgroundColor: "#c0c0c0",
                border: "2px outset #fff",
                cursor: "pointer",
                fontFamily: "Tahoma, Arial, sans-serif",
              }}
              onMouseDown={(e) => {
                (e.target as HTMLButtonElement).style.border = "2px inset #888";
              }}
              onMouseUp={(e) => {
                (e.target as HTMLButtonElement).style.border = "2px outset #fff";
              }}
            >
              OK
            </button>
            <button
              onClick={handleHideClippy}
              style={{
                padding: "3px 8px",
                fontSize: "11px",
                backgroundColor: "#c0c0c0",
                border: "2px outset #fff",
                cursor: "pointer",
                fontFamily: "Tahoma, Arial, sans-serif",
              }}
              onMouseDown={(e) => {
                (e.target as HTMLButtonElement).style.border = "2px inset #888";
              }}
              onMouseUp={(e) => {
                (e.target as HTMLButtonElement).style.border = "2px outset #fff";
              }}
            >
              Don&apos;t show tips
            </button>
          </div>
        </div>
      )}

      {/* Clippy Character */}
      <div
        onClick={() => setIsDismissed(false)}
        style={{
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: "clippy-idle 2s ease-in-out infinite",
        }}
        title="Click me for help!"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/clippy.png"
          alt="Clippy the Office Assistant"
          style={{
            width: "100px",
            height: "auto",
            filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.3))",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes clippy-bounce {
          0% {
            transform: scale(0.8) translateY(10px);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) translateY(-5px);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes clippy-idle {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-3px) rotate(-2deg);
          }
          75% {
            transform: translateY(-3px) rotate(2deg);
          }
        }
      `}</style>
    </div>
  );
}
