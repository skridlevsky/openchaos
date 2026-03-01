"use client";

import { useState, useEffect } from "react";

const CLIPPY_TIPS = [
  "It looks like you're trying to vote on a PR! Would you like help with that?",
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
    // Cat Things
    "Do you know we cannot have enough cats?",
    "Cats can be lefty or righty, just like humans, coincidence?",
    "Do you have cat ?", // Ya, I don't like 2 space indentation
    "Cat person or Dog person ?",
    "Check out some best foods for your cats: <a href='https://htmlify.me/r/f2wd'>Click Here</a>.",
    "Meow Meow",
    "Meow Meow Meow",
    "Meow Meow Meow Meow",
    "Meow Meow Meow Meow Meow",
    "Con you Meow?",
    "Con you Meow for me?",
    "Con you Meow Meow?",
    "Con you Meow Meow for me?",
  "Hey there! 👋 The top-voted PR gets merged daily at 19:00 UTC.",
  "Pro tip: Only 👍 and 👎 reactions count as votes. Blog about it!",
  "Submit a PR to join the chaos. It's like editing a wiki, but with more merge conflicts.",
  "IMPORTANT: PRs with merge conflicts won't win. Keep your branch rebased!",
  "This site is powered by Next.js and AJAX. Web 2.0 is the future!",
  "Have you Dugg this page yet? Don't forget to bookmark it on del.icio.us!",
  "You should totally add us to your RSS reader. We have a feed!", // meow meow
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
  let newIndex: number;
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
  const [alignment, setAlignment] = useState<"left" | "right">("right");

  useEffect(() => {
    const opposite = (side: "left" | "right") => (side === "left" ? "right" : "left");

    const syncFromRadioDom = () => {
      const radio = document.querySelector(".gta-radio-container") as HTMLElement | null;
      const side = radio?.dataset.chaosSide;
      if (side === "left" || side === "right") {
        setAlignment(opposite(side));
      }
    };

    syncFromRadioDom();

    const handleRadioLayout = (event: Event) => {
      const customEvent = event as CustomEvent<{ side?: "left" | "right" }>;
      if (customEvent.detail?.side === "left" || customEvent.detail?.side === "right") {
        setAlignment(opposite(customEvent.detail.side));
      }
    };

    window.addEventListener("openchaos:radio-layout", handleRadioLayout as EventListener);
    return () => window.removeEventListener("openchaos:radio-layout", handleRadioLayout as EventListener);
  }, []);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      if (!isDismissed && isVisible) {
        setCurrentTip((prev) => getRandomTip(prev));
      }
    }, 12000);

    return () => clearInterval(tipInterval);
  }, [isDismissed, isVisible]);

  useEffect(() => {
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
    setTimeout(() => {
      setShowClippy(true);
      setIsDismissed(false);
    }, 30000);
  };

  if (!showClippy) return null;

  return (
    <div
      className={`web2-chat-widget web2-chat-widget-${alignment}`}
      data-chaos-side={alignment}
      style={{
        right: alignment === "right" ? "20px" : undefined,
        left: alignment === "left" ? "20px" : undefined,
      }}
    >
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