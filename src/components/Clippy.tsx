"use client";

import { useState, useEffect } from "react";

const CLIPPY_ASCII_FRAMES = [
  `  __
  /  \\
  |  |
  @  @
  |  |
  || |
  || |
  |\\_|
  \\__\\`,
  `  __
  /  \\
  |  |
  -  -
  |  |
  || |
  || |
  |\\_|
  \\__\\`,
  `  __
  /  \\
  |  |
  @  @
  |  |
  || |
  || |
  |\\_|
  \\__\\`,
  `  __
  /  \\
  |  |
  @  @
  |  |
  || |
  || |
  |\\_|
  \\__\\`,
];

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

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

function createSpeechBubble(text: string, maxWidth: number = 40): string {
  const lines = wrapText(text, maxWidth);
  const maxLineLength = Math.max(...lines.map((line) => line.length), 10);
  const width = maxLineLength + 4; // padding on each side

  let bubble = `┌${"─".repeat(width)}┐\n`;
  
  for (const line of lines) {
    const paddedLine = line.padEnd(maxLineLength+2, " ");
    bubble += `│ ${paddedLine} │\n`;
  }
  
  // Add button row with proper spacing - ensure enough padding on the right
  const buttonText = `  [OK]  [Don't show tips]  `;
  const buttonRowPadded = buttonText.padEnd(maxLineLength+2, " ");
  bubble += `│ ${buttonRowPadded} │\n`;
  bubble += `└${"─".repeat(width)}┘\n`;
  // Arrow on the right side - align to right edge of bubble
  const arrowOffset = width - 2; // Position arrow near right edge
  bubble += `${" ".repeat(arrowOffset)}\\/\n`; // pointer pointing down on the right

  return bubble;
}

export function Clippy() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState(() =>
    Math.floor(Math.random() * CLIPPY_TIPS.length)
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const [showClippy, setShowClippy] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    // Show Clippy after a delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    // Animate ASCII frames
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % CLIPPY_ASCII_FRAMES.length);
    }, 500); // Change frame every 500ms

    return () => clearInterval(interval);
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
        fontFamily: "Courier New, monospace",
      }}
    >
      {/* Speech Bubble */}
      {isVisible && !isDismissed && (
        <div
          style={{
            position: "absolute",
            bottom: "140px",
            right: "0",
            fontFamily: "Courier New, monospace",
            fontSize: "12px",
            lineHeight: "1.2",
            color: "var(--foreground)",
            whiteSpace: "pre",
            animation: "clippy-bounce 0.3s ease-out",
          }}
        >
          <div style={{ position: "relative", display: "inline-block" }}>
            <pre
              className="font-mono text-xs leading-tight whitespace-pre"
              style={{
                margin: 0,
                color: "var(--foreground)",
              }}
            >
              {createSpeechBubble(CLIPPY_TIPS[currentTip])}
            </pre>
            {/* Clickable button areas over ASCII art */}
            <div
              style={{
                position: "absolute",
                bottom: "1.2em",
                left: "0.5ch",
                width: "4ch",
                height: "1.2em",
                cursor: "pointer",
                zIndex: 1,
              }}
              onClick={handleDismiss}
              title="OK"
            />
            <div
              style={{
                position: "absolute",
                bottom: "1.2em",
                left: "7ch",
                width: "14ch",
                height: "1.2em",
                cursor: "pointer",
                zIndex: 1,
              }}
              onClick={handleHideClippy}
              title="Don't show tips"
            />
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
        <pre
          className="font-mono text-xs leading-tight whitespace-pre text-center"
          style={{
            margin: 0,
            color: "var(--foreground)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {CLIPPY_ASCII_FRAMES[currentFrame]}
        </pre>
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
