"use client";

import { useEffect, useState } from "react";

const STATUS_MESSAGES = [
  "Welcome to OpenChaos.dev — powered by AJAX and community votes",
  "Top-voted PR gets merged daily at 19:00 UTC!",
  "Built with Next.js — because Ruby on Rails was too mainstream",
  "Now with 100% more rounded corners and drop shadows",
  "Add us to your Blogroll! openchaos.dev",
  "Perpetual BETA — just like Gmail circa 2006",
  "Web 2.0 compliant — validated by W3C",
  "Subscribe to our RSS feed — it's what all the cool blogs do",
  "This page has been Dugg 1,337 times",
  "Mashup of GitHub API + community chaos = this site",
  "OpenChaos.dev — making the internet better, one PR at a time",
  "Remember to tag this on del.icio.us!",
];

export function StatusBar() {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  // Scroll through messages character by character
  useEffect(() => {
    const message = STATUS_MESSAGES[messageIndex];

    if (charIndex < message.length) {
      const timer = setTimeout(() => {
        setCurrentMessage(message.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Pause at end of message
      const timer = setTimeout(() => {
        setCharIndex(0);
        setCurrentMessage("");
        setMessageIndex((messageIndex + 1) % STATUS_MESSAGES.length);
      }, 1337);
      return () => clearTimeout(timer);
    }
  }, [charIndex, messageIndex]);

  return (
    <div className="status-bar">
      <div className="status-bar-content">
        <div className="status-bar-section status-bar-main">
          <div className="status-bar-text">{currentMessage}</div>
        </div>
        <div className="status-bar-section status-bar-zone">
          <div className="status-bar-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          </div>
          <div className="status-bar-zone-text">Internet</div>
        </div>
        <div className="status-bar-section status-bar-protected">
          <div className="status-bar-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
