"use client";

import { ReactNode } from "react";
import { CursorTrail } from "./CursorTrail";
import { StatusBar } from "./StatusBar";
import { Web2BrowserChrome } from "./Web2BrowserChrome";
import { Clippy } from "./Clippy";
import { Cat } from "./Cat";
import { Web2Footer } from "./Web2Footer";
import { Web2BetaBadge } from "./Web2BetaBadge";
import { Web2RssIcon } from "./Web2RssIcon";
import { Web2TagCloud } from "./Web2TagCloud";
import { Web2SocialBookmarks } from "./Web2SocialBookmarks";
import { Web2DiggCounter } from "./Web2DiggCounter";

interface Web2LayoutProps {
  children: ReactNode;
}

export function Web2Layout({ children }: Web2LayoutProps) {
  return (
    <>
      <CursorTrail />
      <Web2BrowserChrome>
        {/* Announcement Bar */}
        <div className="web2-announcement-bar">
          <span className="web2-announcement-text">
            Welcome to OpenChaos.dev — The community-driven, self-evolving open source project! Vote on PRs. Winner gets merged daily at 19:00 UTC.
          </span>
        </div>
        <Web2BetaBadge />

        <main className="web2-main">
          <div className="web2-page-wrapper">
            {/* Site Header */}
            <div className="web2-site-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <h1 className="web2-site-title">OpenChaos.dev</h1>
                <Web2RssIcon />
              </div>
              <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                A self-evolving open source project — powered by community votes
              </p>
            </div>

            {/* Two-column layout */}
            <div className="web2-two-col">
              {/* Main Content */}
              <div className="web2-col-main">
                {children}
              </div>

              {/* Sidebar */}
              <div className="web2-col-sidebar">
                {/* Action Buttons Widget */}
                <div className="web2-widget">
                  <div className="web2-widget-header">Get Involved</div>
                  <div className="web2-widget-body" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <a
                      href="https://github.com/skridlevsky/openchaos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="guestbook-button"
                      style={{ textAlign: 'center', margin: 0, display: 'block', textDecoration: 'none' }}
                    >
                      View on GitHub
                    </a>
                    <a
                      href="https://discord.gg/6S5T5DyzZq"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="discord-chat-button"
                      style={{ textAlign: 'center', margin: 0, display: 'block' }}
                    >
                      Join the Chaos!
                    </a>
                  </div>
                </div>

                {/* Tag Cloud */}
                <Web2TagCloud />

                {/* Digg-style Vote Counter */}
                <Web2DiggCounter />

                {/* Social Bookmarks */}
                <Web2SocialBookmarks />

              </div>
            </div>

            {/* dickbutt image preserved */}
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <img src="/dickbutt.gif" style={{ width: '200px', display: 'inline-block', borderRadius: '8px', opacity: 0.8 }} alt="" />
            </div>
          </div>

          <Web2Footer />
        </main>

        <Cat />
        <StatusBar />
        <Clippy />
      </Web2BrowserChrome>
    </>
  );
}
