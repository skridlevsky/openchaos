"use client";

import { useState, useEffect, useCallback } from "react";

const FAKE_ERRORS = [
  {
    title: "Internet Explorer",
    message: "Internet Explorer has performed an illegal operation and will be shut down.",
    icon: "⚠️",
  },
  {
    title: "Microsoft Windows",
    message: "This program is not responding. Would you like to send a report to Microsoft?",
    icon: "❌",
  },
  {
    title: "ActiveX Control",
    message: "This page wants to install the following add-on: 'Bitcoin.ocx' from 'Unknown Publisher'. Do you want to allow this?",
    icon: "🛡️",
  },
  {
    title: "MSN Messenger",
    message: "You have 1 new message from xX_CoOlGuY_2003_Xx!",
    icon: "💬",
  },
  {
    title: "Windows Update",
    message: "Important updates are ready to install. Your computer will restart in 5 minutes.",
    icon: "🔄",
  },
  {
    title: "Error",
    message: "Keyboard not found. Press F1 to continue.",
    icon: "⌨️",
  },
  {
    title: "Windows Security",
    message: "Your PC might be at risk! Antivirus software might not be installed. Click here to fix.",
    icon: "🛡️",
  },
  {
    title: "Low Disk Space",
    message: "You are running very low on disk space on Local Disk (C:). Click here to free up space.",
    icon: "💾",
  },
  {
    title: "RealPlayer",
    message: "RealPlayer wants to be your default media player. Allow RealPlayer to check for updates?",
    icon: "▶️",
  },
  {
    title: "You're a Winner!",
    message: "Congratulations! You are the 1,000,000th visitor! Click OK to claim your FREE iPod Nano!",
    icon: "🎉",
  },
];

function WinXPDialog({
  error,
  onClose,
}: {
  error: (typeof FAKE_ERRORS)[number];
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99998,
        fontFamily: "Tahoma, Arial, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#ECE9D8",
          border: "2px solid #0054E3",
          borderRadius: "8px 8px 0 0",
          boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
          minWidth: "350px",
          maxWidth: "450px",
          overflow: "hidden",
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            background: "linear-gradient(180deg, #0A246A 0%, #A6CAF0 8%, #0A246A 90%)",
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
              textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
            }}
          >
            {error.title}
          </span>
          <button
            onClick={onClose}
            style={{
              width: "21px",
              height: "21px",
              background: "linear-gradient(180deg, #E47066 0%, #C92B1E 50%, #B01A0D 100%)",
              border: "1px solid #fff",
              borderRadius: "3px",
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px", display: "flex", gap: "15px" }}>
          <div style={{ fontSize: "32px" }}>{error.icon}</div>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#000",
              lineHeight: 1.5,
              flex: 1,
            }}
          >
            {error.message}
          </p>
        </div>

        {/* Buttons */}
        <div
          style={{
            padding: "10px 20px 15px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "4px 20px",
              fontSize: "11px",
              backgroundColor: "#ECE9D8",
              border: "1px solid #003C74",
              borderRadius: "3px",
              cursor: "pointer",
              boxShadow: "1px 1px 1px rgba(0,0,0,0.2)",
            }}
          >
            OK
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "4px 20px",
              fontSize: "11px",
              backgroundColor: "#ECE9D8",
              border: "1px solid #003C74",
              borderRadius: "3px",
              cursor: "pointer",
              boxShadow: "1px 1px 1px rgba(0,0,0,0.2)",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function FakeErrors() {
  const [activeError, setActiveError] = useState<
    (typeof FAKE_ERRORS)[number] | null
  >(null);

  const triggerRandomError = useCallback(() => {
    const randomError =
      FAKE_ERRORS[Math.floor(Math.random() * FAKE_ERRORS.length)];
    setActiveError(randomError);
  }, []);

  useEffect(() => {
    // Randomly trigger fake errors for that authentic Windows XP experience
    const errorInterval = setInterval(() => {
      // ~20% chance every 45 seconds
      if (Math.random() < 0.2) {
        triggerRandomError();
      }
    }, 45000);

    // Also trigger one error after initial page load (30% chance)
    const initialErrorTimer = setTimeout(() => {
      if (Math.random() < 0.3) {
        triggerRandomError();
      }
    }, 20000);

    return () => {
      clearInterval(errorInterval);
      clearTimeout(initialErrorTimer);
    };
  }, [triggerRandomError]);

  if (!activeError) return null;

  return (
    <WinXPDialog error={activeError} onClose={() => setActiveError(null)} />
  );
}
