"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { soundPlayer } from "@/utils/sounds";

interface Web2BrowserChromeProps {
  children: ReactNode;
}

export function Web2BrowserChrome({ children }: Web2BrowserChromeProps) {
  const router = useRouter();
  const { user, login, logout } = useAuth();
  const [showBookmarksPanel, setShowBookmarksPanel] = useState(false);

  const handleBack = () => {
    window.history.back();
  };

  const handleForward = () => {
    window.history.forward();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleBookmarks = () => {
    setShowBookmarksPanel(!showBookmarksPanel);
  };

  return (
    <div className="web2-browser-window">
      {/* macOS-style Title Bar */}
      <div className="web2-titlebar">
        <div className="web2-titlebar-buttons">
          <div className="web2-traffic-light web2-traffic-close" />
          <div className="web2-traffic-light web2-traffic-minimize" />
          <div className="web2-traffic-light web2-traffic-maximize" />
        </div>
        <span className="web2-titlebar-text">
          {user ? `OpenChaos.dev — ${user.login} — Mozilla Firefox` : 'OpenChaos.dev — Mozilla Firefox'}
        </span>
        <div style={{ width: 54 }} />
      </div>

      {/* Tab Bar */}
      <div className="web2-tabbar">
        <div className="web2-tab active">
          <span>OpenChaos.dev</span>
          <span className="web2-tab-close">x</span>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="web2-navbar">
        <button className="web2-nav-button" title="Back" onClick={handleBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button className="web2-nav-button" title="Forward" onClick={handleForward}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <button className="web2-nav-button" title="Refresh" onClick={handleRefresh}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 11-3-6.7" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>
        <div className="web2-nav-separator" />
        <button className="web2-nav-button" title="Home" onClick={handleHome}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </button>
        <button className="web2-nav-button" title="Bookmarks" onClick={handleBookmarks} style={showBookmarksPanel ? { background: '#ddd' } : {}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
        </button>
      </div>

      {/* Address Bar */}
      <div className="web2-addressbar">
        <span className="web2-addressbar-label">URL:</span>
        <div className="web2-addressbar-input">
          <span className="web2-addressbar-padlock">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
            </svg>
          </span>
          <span className="web2-addressbar-url">https://openchaos.dev</span>
        </div>
        <button className="web2-addressbar-go">Go</button>
        {user ? (
          <button
            className="web2-auth-button web2-auth-button-logout"
            onClick={() => {
              soundPlayer.playShutdown();
              logout();
            }}
            title={`Logged in as ${user.login} — click to logout`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.avatar_url} alt={user.login} className="web2-auth-avatar" />
            Logout
          </button>
        ) : (
          <button
            className="web2-auth-button web2-auth-button-login"
            onClick={() => {
              const audio = soundPlayer.playStartup();
              const loginTimeout = setTimeout(() => login(), 2000);
              if (audio) {
                audio.addEventListener('ended', () => {
                  clearTimeout(loginTimeout);
                  login();
                });
                audio.addEventListener('error', () => {
                  clearTimeout(loginTimeout);
                  login();
                });
              } else {
                clearTimeout(loginTimeout);
                login();
              }
            }}
            title="Login with GitHub to vote"
          >
            🔐 Login
          </button>
        )}
      </div>

      {/* Content Area with Side Panels */}
      <div className="web2-content-wrapper">
        {/* Bookmarks Panel */}
        {showBookmarksPanel && (
          <div className="web2-side-panel">
            <div className="web2-panel-header">
              <span>Bookmarks</span>
              <button className="web2-panel-close" onClick={() => setShowBookmarksPanel(false)}>x</button>
            </div>
            <div className="web2-panel-content">
              <div className="web2-bookmarks-list">
                <div className="web2-bookmark-item" onClick={() => router.push('/')}>
                  <span className="web2-bookmark-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                  </span>
                  <span>OpenChaos Home</span>
                </div>
                <div className="web2-bookmark-item" onClick={() => window.open('https://github.com/skridlevsky/openchaos', '_blank')}>
                  <span className="web2-bookmark-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  </span>
                  <span>GitHub Repo</span>
                </div>
                <div className="web2-bookmark-item web2-bookmark-discord" onClick={() => window.open('https://discord.gg/6S5T5DyzZq', '_blank')}>
                  <span className="web2-bookmark-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#5865f2"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" /></svg>
                  </span>
                  <span>OpenChaos Discord</span>
                </div>
                <div className="web2-bookmark-separator" />
                <div className="web2-bookmark-item" onClick={() => window.open('https://digg.com', '_blank')}>
                  <span className="web2-bookmark-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h4v18H2V8h4V2zm0 14v-4H6v4zm10-8h4v12h-8v-4h4V8zm0 8v-4h-0v4zM12 8h4v4h-4V8zm0-6h4v4h-4V2z" /></svg>
                  </span>
                  <span>Digg</span>
                </div>
                <div className="web2-bookmark-item" onClick={() => window.open('https://del.icio.us', '_blank')}>
                  <span className="web2-bookmark-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                  </span>
                  <span>del.icio.us</span>
                </div>
                <div className="web2-bookmark-item" onClick={() => window.open('https://www.stumbleupon.com', '_blank')}>
                  <span className="web2-bookmark-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10" /><path d="M22 12c0-2-1-3-2.5-3S17 10 17 12v1.5" /><path d="M12 8c-2.2 0-4 1.8-4 4v2c0 2.2 1.8 4 4 4s4-1.8 4-4" /></svg>
                  </span>
                  <span>StumbleUpon</span>
                </div>
                <div className="web2-bookmark-item" onClick={() => window.open('https://www.flickr.com', '_blank')}>
                  <span className="web2-bookmark-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="12" r="5" fill="#0063dc" /><circle cx="17" cy="12" r="5" fill="#ff0084" /></svg>
                  </span>
                  <span>Flickr</span>
                </div>
                <div className="web2-bookmark-item" onClick={() => window.open('https://techcrunch.com', '_blank')}>
                  <span className="web2-bookmark-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0a9b00"><path d="M4 4h16v3H4zm0 6h10v3H4zm0 6h13v3H4z" /></svg>
                  </span>
                  <span>TechCrunch</span>
                </div>
                <div className="web2-bookmark-item" onClick={() => window.open('https://wordpress.com', '_blank')}>
                  <span className="web2-bookmark-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#21759b"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zM3.5 12c0-1.19.25-2.32.69-3.35l3.8 10.41A8.51 8.51 0 013.5 12zm8.5 8.5c-.83 0-1.64-.12-2.4-.34l2.55-7.41 2.61 7.15c.02.04.04.08.06.11-.9.32-1.85.49-2.82.49zm1.1-12.47c.51-.03.97-.08.97-.08.46-.05.4-.73-.05-.7 0 0-1.38.11-2.27.11-.84 0-2.24-.11-2.24-.11-.46-.03-.51.68-.05.7 0 0 .43.06.89.08l1.32 3.61-1.85 5.56-3.08-9.17c.51-.03.97-.08.97-.08.46-.05.4-.73-.06-.7 0 0-1.37.11-2.26.11-.16 0-.34 0-.54-.01A8.49 8.49 0 0112 3.5c2.13 0 4.07.78 5.57 2.07-.04 0-.07-.01-.1-.01-.84 0-1.44.73-1.44 1.52 0 .7.41 1.3.84 2 .33.57.71 1.31.71 2.37 0 .74-.28 1.59-.66 2.78l-.86 2.87-3.12-9.27z" /></svg>
                  </span>
                  <span>WordPress</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="web2-content-area">
          {children}
        </div>
      </div>
    </div>
  );
}
