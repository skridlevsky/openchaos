"use client";

import { useEffect, useState, useRef, useCallback } from "react";

type ShutdownState = "shutdown" | "restart" | "standby" | "logoff" | null;

const PINNED_ITEMS = [
  { icon: "\u{1F310}", label: "Internet Explorer", action: "scroll-top" },
  { icon: "\u{1F4E7}", label: "Outlook Express", action: "mailto" },
];

const FREQUENT_ITEMS = [
  { icon: "\u{1F4CB}", label: "Open PRs", action: "scroll-pr-list" },
  { icon: "\u{1F3C6}", label: "Hall of Chaos", action: "scroll-hall-of-chaos" },
  { icon: "\u{1F4DD}", label: "Guestbook", action: "guestbook" },
  { icon: "\u{1F3B5}", label: "Windows Media Player", action: "scroll-midi" },
  { icon: "\u{1F4AC}", label: "MSN Messenger", action: "discord" },
];

const RIGHT_ITEMS = [
  { icon: "\u{1F4C1}", label: "My Documents", action: "github" },
  { icon: "\u{1F5A5}\uFE0F", label: "My Computer", action: "alert-computer" },
  { icon: "\u{1F3AE}", label: "Minesweeper", action: "minesweeper" },
  { icon: "\u{1F3A8}", label: "MS Paint", action: "paint" },
  { icon: "\u{1F527}", label: "Control Panel", action: "alert-denied" },
  { icon: "\u2753", label: "Help and Support", action: "alert-clippy" },
];

const ALL_PROGRAMS = [
  { icon: "\u{1F0CF}", label: "Solitaire", url: "https://www.solitr.com/" },
  { icon: "\u{1F3B1}", label: "3D Pinball", url: "https://alula.github.io/SpaceCadetPinball/" },
  { icon: "\u{1F310}", label: "FrontPage 2000", url: "https://en.wikipedia.org/wiki/Microsoft_FrontPage" },
  { icon: "\u{1F435}", label: "Bonzi Buddy", url: "https://bonzibuddy.tk/" },
  { icon: "\u{1F30D}", label: "Netscape Navigator", url: "https://archive.org/details/netscape-browser-collection" },
  { icon: "\u{1F4E6}", label: "WinRAR - 40 day trial", url: "https://www.win-rar.com/" },
  { icon: "\u{1F4A3}", label: "Minesweeper", url: "https://minesweeper.online/" },
  { icon: "\u2660\uFE0F", label: "Hearts", url: "https://cardgames.io/hearts/" },
  { icon: "\u{1F58C}\uFE0F", label: "Paint", url: "https://jspaint.app" },
  { icon: "\u{1F4DD}", label: "Notepad", url: "https://notepad-online.net/" },
];

function scrollToElement(selector: string) {
  const contentArea = document.querySelector(".ie6-content-area");
  if (contentArea) {
    const target = contentArea.querySelector(selector);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  }
  // Fallback: try the whole document
  const target = document.querySelector(selector);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function StartMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const [shutdownState, setShutdownState] = useState<ShutdownState>(null);
  const [showShutdownDialog, setShowShutdownDialog] = useState(false);
  const [shutdownMessage, setShutdownMessage] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setShowAllPrograms(false);
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeMenu]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeMenu]);

  function handleAction(action: string) {
    closeMenu();

    switch (action) {
      case "scroll-top":
        scrollToElement(".ie6-header");
        break;
      case "mailto":
        window.open("mailto:skridlevsky@geocities.com", "_self");
        break;
      case "scroll-pr-list":
        scrollToElement("#pr-list");
        break;
      case "scroll-hall-of-chaos":
        scrollToElement("#hall-of-chaos");
        break;
      case "guestbook": {
        const guestbookBtn = document.querySelector(".guestbook-button") as HTMLButtonElement | null;
        if (guestbookBtn) guestbookBtn.click();
        break;
      }
      case "scroll-midi":
        scrollToElement(".midi-player-container");
        break;
      case "discord":
        window.open("https://discord.gg/6S5T5DyzZq", "_blank");
        break;
      case "github":
        window.open("https://github.com/skridlevsky/openchaos", "_blank");
        break;
      case "alert-computer":
        alert("ERROR: Computer not found. Please check your computer and try again.");
        break;
      case "minesweeper":
        window.open("https://minesweeper.online/", "_blank");
        break;
      case "paint":
        window.open("https://jspaint.app", "_blank");
        break;
      case "calculator":
        window.open("https://www.calculator.net/", "_blank");
        break;
      case "alert-denied":
        alert("Access Denied. Contact your system administrator.");
        break;
      case "alert-clippy":
        alert("It looks like you're trying to get help!\n\nHave you tried turning it off and on again?\n\n- Clippy");
        break;
    }
  }

  function handleShutdown(type: ShutdownState) {
    setShowShutdownDialog(false);
    closeMenu();

    if (type === "standby") {
      setShutdownState("standby");
      // Dim screen for 2 seconds
      setTimeout(() => setShutdownState(null), 2000);
      return;
    }

    if (type === "logoff") {
      setShutdownState("logoff");
      setShutdownMessage("Logging off...");
      setTimeout(() => window.location.reload(), 2000);
      return;
    }

    if (type === "shutdown") {
      setShutdownState("shutdown");
      setShutdownMessage("Windows is shutting down...");
      setTimeout(() => window.location.reload(), 2000);
      return;
    }

    if (type === "restart") {
      setShutdownState("restart");
      setShutdownMessage("Windows is restarting...");
      setTimeout(() => window.location.reload(), 2000);
      return;
    }
  }

  return (
    <>
      {/* Start Button */}
      <button
        ref={buttonRef}
        className={`start-menu-button ${isOpen ? "start-menu-button-active" : ""}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setShowAllPrograms(false);
        }}
      >
        <span className="start-menu-flag">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="0" y="0" width="6" height="6" fill="#FF0000" />
            <rect x="7" y="0" width="6" height="6" fill="#00A000" />
            <rect x="0" y="7" width="6" height="6" fill="#0000FF" />
            <rect x="7" y="7" width="6" height="6" fill="#FFD000" />
          </svg>
        </span>
        <span className="start-menu-button-text">Start</span>
      </button>

      {/* Menu Panel */}
      {isOpen && (
        <div ref={panelRef} className="start-menu-panel">
          {/* Header */}
          <div className="start-menu-header">
            <span className="start-menu-avatar">{"\u{1F464}"}</span>
            <span className="start-menu-username">Chaos User</span>
          </div>

          {/* Body */}
          <div className="start-menu-body">
            {/* Left Column */}
            <div className="start-menu-left">
              {!showAllPrograms ? (
                <>
                  {PINNED_ITEMS.map((item) => (
                    <button
                      key={item.label}
                      className="start-menu-item start-menu-item-pinned"
                      onClick={() => handleAction(item.action)}
                    >
                      <span className="start-menu-item-icon">{item.icon}</span>
                      <span className="start-menu-item-label">
                        <strong>{item.label}</strong>
                      </span>
                    </button>
                  ))}
                  <div className="start-menu-separator" />
                  {FREQUENT_ITEMS.map((item) => (
                    <button
                      key={item.label}
                      className="start-menu-item"
                      onClick={() => handleAction(item.action)}
                    >
                      <span className="start-menu-item-icon">{item.icon}</span>
                      <span className="start-menu-item-label">{item.label}</span>
                    </button>
                  ))}
                  <div className="start-menu-separator" />
                  <button
                    className="start-menu-item start-menu-all-programs"
                    onClick={() => setShowAllPrograms(true)}
                  >
                    <span className="start-menu-item-label">
                      All Programs
                    </span>
                    <span className="start-menu-arrow">{"\u25B6"}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="start-menu-item start-menu-back"
                    onClick={() => setShowAllPrograms(false)}
                  >
                    <span className="start-menu-arrow-back">{"\u25C0"}</span>
                    <span className="start-menu-item-label">
                      <strong>Back</strong>
                    </span>
                  </button>
                  <div className="start-menu-separator" />
                  {ALL_PROGRAMS.map((program) => (
                    <button
                      key={program.label}
                      className="start-menu-item"
                      onClick={() => {
                        closeMenu();
                        window.open(program.url, "_blank");
                      }}
                    >
                      <span className="start-menu-item-icon">{program.icon}</span>
                      <span className="start-menu-item-label">{program.label}</span>
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Right Column */}
            <div className="start-menu-right">
              {RIGHT_ITEMS.map((item) => (
                <button
                  key={item.label}
                  className="start-menu-item"
                  onClick={() => handleAction(item.action)}
                >
                  <span className="start-menu-item-icon">{item.icon}</span>
                  <span className="start-menu-item-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="start-menu-footer">
            <button
              className="start-menu-footer-button"
              onClick={() => handleShutdown("logoff")}
            >
              <span className="start-menu-footer-icon">{"\u{1F6AA}"}</span>
              Log Off
            </button>
            <button
              className="start-menu-footer-button"
              onClick={() => {
                setShowShutdownDialog(true);
              }}
            >
              <span className="start-menu-footer-icon">{"\u{1F534}"}</span>
              Turn Off Computer
            </button>
          </div>
        </div>
      )}

      {/* Shutdown Dialog */}
      {showShutdownDialog && (
        <div className="start-menu-shutdown-overlay" onClick={() => setShowShutdownDialog(false)}>
          <div className="start-menu-shutdown-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="start-menu-shutdown-title">Turn off computer</div>
            <div className="start-menu-shutdown-body">
              <button
                className="start-menu-shutdown-option start-menu-shutdown-standby"
                onClick={() => handleShutdown("standby")}
              >
                <span className="start-menu-shutdown-option-icon">{"\u{1F319}"}</span>
                <span>Stand By</span>
              </button>
              <button
                className="start-menu-shutdown-option start-menu-shutdown-turnoff"
                onClick={() => handleShutdown("shutdown")}
              >
                <span className="start-menu-shutdown-option-icon">{"\u{1F534}"}</span>
                <span>Turn Off</span>
              </button>
              <button
                className="start-menu-shutdown-option start-menu-shutdown-restart"
                onClick={() => handleShutdown("restart")}
              >
                <span className="start-menu-shutdown-option-icon">{"\u{1F504}"}</span>
                <span>Restart</span>
              </button>
            </div>
            <div className="start-menu-shutdown-actions">
              <button
                className="start-menu-shutdown-cancel"
                onClick={() => setShowShutdownDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standby overlay (dims screen) */}
      {shutdownState === "standby" && (
        <div
          className="start-menu-standby-overlay"
          onClick={() => setShutdownState(null)}
        />
      )}

      {/* Shutdown / Restart / Logoff blue screen */}
      {(shutdownState === "shutdown" || shutdownState === "restart" || shutdownState === "logoff") && (
        <div className="start-menu-bluescreen-overlay">
          <div className="start-menu-bluescreen-text">{shutdownMessage}</div>
        </div>
      )}
    </>
  );
}
