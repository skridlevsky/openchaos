"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "openchaos_welcome_seen";

export function WelcomePopup() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    previousFocusRef.current = document.activeElement;
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  });

  function dismiss() {
    setIsClosing(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    }, 200);
  }

  if (!isMounted || !isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes welcomeFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes welcomeFadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes backdropFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to OpenChaos"
        onClick={dismiss}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0, 0, 0, 0.6)",
          animation: `${isClosing ? "backdropFadeOut" : "backdropFadeIn"} 200ms ease`,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            background: "#fff",
            color: "#1a1a1a",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "420px",
            width: "90vw",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            animation: `${isClosing ? "welcomeFadeOut" : "welcomeFadeIn"} 200ms ease`,
          }}
        >
          <button
            onClick={dismiss}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#999",
              lineHeight: 1,
              padding: "4px",
            }}
          >
            ✕
          </button>

          <h2 style={{ margin: "0 0 16px", fontSize: "22px", fontWeight: 700 }}>
            What is OpenChaos?
          </h2>

          <p style={{ margin: "0 0 12px", fontSize: "15px", lineHeight: 1.6, color: "#444" }}>
            A self-evolving website where the community submits PRs, votes with
            GitHub reactions, and the winner merges daily at 19:00 UTC.
          </p>

          <p style={{ margin: "0 0 24px", fontSize: "15px", lineHeight: 1.6, color: "#444" }}>
            PR titles must rhyme to be eligible.
          </p>

          <button
            ref={buttonRef}
            onClick={dismiss}
            style={{
              display: "block",
              width: "100%",
              padding: "10px 0",
              fontSize: "15px",
              fontWeight: 600,
              color: "#fff",
              background: "#111",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
}
