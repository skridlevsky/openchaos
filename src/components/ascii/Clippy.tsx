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
  "It looks like you're trying to fix bugs in my implementation. Would you like help with that?",
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

function createSpeechBubble(
  text: string,
  maxWidth: number = 40
): { bubbleLines: string[]; innerWidth: number; width: number } {
  const lines = wrapText(text, maxWidth);
  const maxLineLength = Math.max(...lines.map((line) => line.length), 10);
  const width = maxLineLength + 4; // padding on each side
  const innerWidth = width - 2; // inside the │ │

  const bubbleLines: string[] = [];
  bubbleLines.push(`┌${"─".repeat(width)}┐`);

  for (const line of lines) {
    const paddedLine = line.padEnd(maxLineLength + 2, " ");
    bubbleLines.push(`│ ${paddedLine} │`);
  }

  bubbleLines.push(`└${"─".repeat(width)}┘`);
  const arrowOffset = width - 2;
  bubbleLines.push(`${" ".repeat(arrowOffset)}\\/`);

  return { bubbleLines, innerWidth, width };
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
      {isVisible && !isDismissed && (() => {
        const { bubbleLines, innerWidth } = createSpeechBubble(CLIPPY_TIPS[currentTip]);
        // Split: top + content lines, then we insert button row, then bottom + arrow
        const contentEnd = bubbleLines.findIndex((l) => l.startsWith("└"));
        const topAndContent = bubbleLines.slice(0, contentEnd);
        const bottomAndArrow = bubbleLines.slice(contentEnd);
        const buttonRowText = "  [OK]  [Don't show tips]  ";
        const buttonRowPadding = Math.max(0, innerWidth - buttonRowText.length);
        return (
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
            <div
              style={{
                position: "relative",
                display: "inline-block",
                backgroundColor: "black",
                padding: "2px 0",
              }}
            >
              <pre
                className="font-mono text-xs leading-tight whitespace-pre"
                style={{
                  margin: 0,
                  color: "var(--foreground)",
                }}
              >
                {topAndContent.join("\n")}
                {"\n"}
                {"│ "}
                {"  "}
                <button
                  type="button"
                  onClick={handleDismiss}
                  title="OK"
                  style={{
                    font: "inherit",
                    color: "inherit",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  [OK]
                </button>
                {"  "}
                <button
                  type="button"
                  onClick={handleHideClippy}
                  title="Don't show tips"
                  style={{
                    font: "inherit",
                    color: "inherit",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  {"[Don't show tips]"}
                </button>
                {buttonRowPadding > 0 ? " ".repeat(buttonRowPadding) : ""}
                {"   │\n"}
                {bottomAndArrow.join("\n")}
              </pre>
            </div>
          </div>
        );
      })()}

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
