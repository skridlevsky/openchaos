"use client";

import { useEffect, useState } from "react";
import { StartMenu } from "./StartMenu";

const STATUS_MESSAGES = [
  "Welcome to my homepage! Sign my guestbook!",
  "This site is best viewed at 800x600 resolution",
  "Webmaster: skridlevsky@geocities.com",
  "You are visitor #1,337!",
  "Made with Microsoft FrontPage 2000",
  "Optimized for Internet Explorer 6.0",
  "© 1999-2000 All Rights Reserved",
  "Email me if anything is broken!",
  "Right-click to add to favorites!",
  "JavaScript enabled",
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
        <StartMenu />
        <div className="status-bar-section status-bar-main">
          <div className="status-bar-text">{currentMessage}</div>
        </div>
        <div className="status-bar-section status-bar-zone">
          <div className="status-bar-icon">🌐</div>
          <div className="status-bar-zone-text">Internet</div>
        </div>
        <div className="status-bar-section status-bar-protected">
          <div className="status-bar-icon">🔒</div>
        </div>
      </div>
    </div>
  );
}
