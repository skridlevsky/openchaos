"use client";

import { useState, useEffect } from "react";

const CLIPPY_TIPS = [
  "Hey there! 👋 The top-voted PR gets merged daily at 19:00 UTC.",
  "Pro tip: Only 👍 and 👎 reactions count as votes. Blog about it!",
  "Submit a PR to join the chaos. It's like editing a wiki, but with more merge conflicts.",
  "IMPORTANT: PRs with merge conflicts won't win. Keep your branch rebased!",
  "This site is powered by Next.js and AJAX. Web 2.0 is the future!",
  "Have you Dugg this page yet? Don't forget to bookmark it on del.icio.us!",
  "You should totally add us to your RSS reader. We have a feed!",
  "Remember when every site had a BETA badge? Oh wait, we still do.",
  "Fun fact: This site runs on Web 2.0 technology. It's all about the rounded corners.",
  "Want to contribute? Fork the repo, submit a PR, and let the community decide!",
  "The community decides which PRs get merged. It's like Digg, but for code.",
  "Did you know you can vote on PRs directly on GitHub? It's very Web 2.0.",
  "Tag cloud not interactive enough? Try submitting a PR to make it better!",
  "This site is in perpetual BETA. Just like Gmail was for five years.",
  "Is your startup idea disrupting something? Submit a PR about it.",
  "We don't have a podcast yet, but we're thinking about it. Stay tuned!",
  "Don't forget to StumbleUpon this page. Wait, does that still work?",
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
    // Show after a delay
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
    // Always comes back
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

  const handleHide = () => {
    setShowClippy(false);
    // Respects your wishes... for about 30 seconds
    setTimeout(() => {
      setShowClippy(true);
      setIsDismissed(false);
    }, 30000);
  };

  if (!showClippy) return null;

  return (
    <div className="web2-chat-widget">
      {/* Chat Bubble */}
      {isVisible && !isDismissed && (
        <div className="web2-chat-bubble web2-chat-bubble-border">
          <p className="web2-chat-message">
            {CLIPPY_TIPS[currentTip]}
          </p>

          <div className="web2-chat-actions">
            <button onClick={handleDismiss} className="web2-chat-btn">
              OK
            </button>
            <button onClick={handleHide} className="web2-chat-btn">
              Don&apos;t show tips
            </button>
          </div>
        </div>
      )}

      {/* Chat Trigger Button */}
      <button
        onClick={() => setIsDismissed(false)}
        className="web2-chat-trigger"
        title="Need help?"
      >
        ?
      </button>
    </div>
  );
}
