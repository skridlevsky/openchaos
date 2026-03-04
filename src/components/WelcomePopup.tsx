"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "openchaos_welcome_seen";

type Variant = "ascii" | "web2" | "newspaper";

interface VariantConfig {
  backdrop: string;
  cardStyle: React.CSSProperties;
  closeStyle: React.CSSProperties;
  heading: React.ReactNode;
  body: React.ReactNode;
  buttonStyle: React.CSSProperties;
  buttonLabel: string;
  /** Extra chrome rendered before the card body (e.g. title bar) */
  chrome?: React.ReactNode;
}

function getConfig(variant: Variant, dismiss: () => void): VariantConfig {
  switch (variant) {
    case "ascii":
      return {
        backdrop: "rgba(0, 0, 0, 0.85)",
        cardStyle: {
          background: "#000",
          color: "#00ff00",
          border: "1px solid #00ff00",
          borderRadius: 0,
          padding: "32px",
          maxWidth: "420px",
          width: "90vw",
          fontFamily: "monospace",
          position: "relative",
        },
        closeStyle: {
          position: "absolute",
          top: "8px",
          right: "12px",
          background: "none",
          border: "none",
          fontSize: "18px",
          cursor: "pointer",
          color: "#00ff00",
          fontFamily: "monospace",
          lineHeight: 1,
          padding: "4px",
        },
        heading: (
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: "18px",
              fontWeight: 700,
              fontFamily: "monospace",
              color: "#00ff00",
            }}
          >
            {">"} WELCOME TO OPENCHAOS.DEV
          </h2>
        ),
        body: (
          <>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#00ff00",
                fontFamily: "monospace",
              }}
            >
              This site evolves itself. The community submits PRs, votes with
              GitHub reactions, and the top PR merges daily at 19:00 UTC.
            </p>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#00ff00",
                fontFamily: "monospace",
              }}
            >
              Warning: PR titles must rhyme to be eligible.
            </p>
          </>
        ),
        buttonStyle: {
          display: "block",
          width: "100%",
          padding: "10px 0",
          fontSize: "14px",
          fontWeight: 600,
          color: "#00ff00",
          background: "transparent",
          border: "1px solid #00ff00",
          borderRadius: 0,
          cursor: "pointer",
          fontFamily: "monospace",
        },
        buttonLabel: "[ ENTER ]",
      };

    case "web2":
      return {
        backdrop: "rgba(0, 50, 50, 0.5)",
        cardStyle: {
          background: "#f0f0f0",
          color: "#1a1a1a",
          border: "2px outset #ddd",
          borderRadius: 0,
          padding: 0,
          maxWidth: "420px",
          width: "90vw",
          fontFamily: "Tahoma, Verdana, Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        },
        closeStyle: {
          position: "absolute",
          top: "4px",
          right: "8px",
          background: "none",
          border: "none",
          fontSize: "14px",
          cursor: "pointer",
          color: "#fff",
          fontFamily: "Tahoma, Verdana, Arial, sans-serif",
          fontWeight: 700,
          lineHeight: 1,
          padding: "2px 4px",
          zIndex: 1,
        },
        chrome: (
          <div
            style={{
              background: "linear-gradient(180deg, #0058e6 0%, #0040a0 100%)",
              color: "#fff",
              padding: "6px 10px",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "Tahoma, Verdana, Arial, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "12px" }}>&#9679;</span> Welcome.exe
          </div>
        ),
        heading: (
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "18px",
              fontWeight: 700,
              fontFamily: "Tahoma, Verdana, Arial, sans-serif",
              textAlign: "center",
            }}
          >
            ★ Welcome to OpenChaos! ★
          </h2>
        ),
        body: (
          <div style={{ padding: "20px 24px 0" }}>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#333",
              }}
            >
              This site evolves itself! The community submits PRs, votes with
              GitHub reactions, and the top PR merges every day at 19:00 UTC.
            </p>
            <p
              style={{
                margin: "0 0 20px",
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#333",
              }}
            >
              Oh, and PR titles have to rhyme 😎
            </p>
          </div>
        ),
        buttonStyle: {
          display: "block",
          width: "calc(100% - 48px)",
          margin: "0 24px 20px",
          padding: "6px 0",
          fontSize: "13px",
          fontWeight: 600,
          color: "#1a1a1a",
          background: "#dfdfdf",
          border: "2px outset #ddd",
          borderRadius: 0,
          cursor: "pointer",
          fontFamily: "Tahoma, Verdana, Arial, sans-serif",
        },
        buttonLabel: "OK",
      };

    case "newspaper":
      return {
        backdrop: "rgba(0, 0, 0, 0.6)",
        cardStyle: {
          background: "#f4ede4",
          color: "#2a2218",
          borderRadius: 0,
          padding: "32px",
          maxWidth: "420px",
          width: "90vw",
          fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
          position: "relative",
          borderTop: "4px double #2a2218",
        },
        closeStyle: {
          position: "absolute",
          top: "12px",
          right: "12px",
          background: "none",
          border: "none",
          fontSize: "18px",
          cursor: "pointer",
          color: "#8a7b6b",
          fontFamily: "Georgia, 'Times New Roman', serif",
          lineHeight: 1,
          padding: "4px",
        },
        heading: (
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: "26px",
              fontWeight: 700,
              fontFamily:
                "'Playfair Display', Georgia, 'Times New Roman', serif",
              textAlign: "center",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Extra! Extra!
          </h2>
        ),
        body: (
          <>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: "15px",
                lineHeight: 1.7,
                color: "#3d3225",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              A self-evolving publication where the community submits pull
              requests, casts votes via GitHub reactions, and the winning edition
              goes to press daily at 19:00 UTC.
            </p>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "15px",
                lineHeight: 1.7,
                color: "#3d3225",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
              }}
            >
              All submissions must bear a rhyming headline.
            </p>
          </>
        ),
        buttonStyle: {
          display: "block",
          width: "100%",
          padding: "10px 0",
          fontSize: "15px",
          fontWeight: 600,
          color: "#f4ede4",
          background: "#2a2218",
          border: "none",
          borderRadius: 0,
          cursor: "pointer",
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: "0.05em",
        },
        buttonLabel: "Read On",
      };
  }
}

interface Props {
  variant?: Variant;
}

export function WelcomePopup({ variant = "ascii" }: Props) {
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

  const config = getConfig(variant, dismiss);

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
          background: config.backdrop,
          animation: `${isClosing ? "backdropFadeOut" : "backdropFadeIn"} 200ms ease`,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            ...config.cardStyle,
            animation: `${isClosing ? "welcomeFadeOut" : "welcomeFadeIn"} 200ms ease`,
          }}
        >
          <button onClick={dismiss} aria-label="Close" style={config.closeStyle}>
            ✕
          </button>

          {config.chrome}

          {variant === "web2" ? (
            <>
              <div style={{ padding: "20px 24px 0" }}>{config.heading}</div>
              {config.body}
            </>
          ) : (
            <>
              {config.heading}
              {config.body}
            </>
          )}

          <button ref={buttonRef} onClick={dismiss} style={config.buttonStyle}>
            {config.buttonLabel}
          </button>
        </div>
      </div>
    </>
  );
}
