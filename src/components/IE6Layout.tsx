"use client";

import { ReactNode, useState } from "react";
import { Guestbook } from "./Guestbook";
import { CursorTrail } from "./CursorTrail";
import { MidiPlayer } from "./MidiPlayer";
import { TreeGame } from "./TreeGame";
import { StatusBar } from "./StatusBar";
import { IE6BrowserChrome } from "./IE6BrowserChrome";
import { Clippy } from "./Clippy";
import { Cat } from "./Cat";

interface IE6LayoutProps {
  children: ReactNode;
}

export function IE6Layout({ children }: IE6LayoutProps) {
  const [isMidiPlayerOpen, setIsMidiPlayerOpen] = useState(true);
  return (
    <>
      <CursorTrail />
      <IE6BrowserChrome>
      {/* IE6 Compatibility Mode Header */}
      <div className="ie6-header">
        🔥 Best Viewed in Internet Explorer 6.0 at 800x600 Resolution 🔥
      </div>

      <main className="ie6-main">
        {/* Classic table-based layout */}
        <table width="100%" border={3} cellPadding={10} cellSpacing={0} className="ie6-main-table">
          <tbody>
            <tr>
              <td className="ie6-header-cell">
                <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
                  <tbody>
                    <tr>
                      <td className="ie6-header-cell">
                        <span className="ie6-header-text">
                          <b>
                            {/* @ts-expect-error marquee is deprecated but used for retro styling */}
                            <marquee behavior="alternate" scrollamount="10">
                              <span className="sparkle-rotate-glint">⭐</span> OPENCHAOS.DEV <span className="sparkle-rotate-glint sparkle-delay-2">⭐</span>
                            {/* @ts-expect-error marquee is deprecated but used for retro styling */}
                            </marquee>
                          </b>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            <tr>
              <td className="ie6-marquee-cell">
                <span className="ie6-marquee-text">
                  {/* @ts-expect-error marquee is deprecated but used for retro styling */}
                  <marquee scrollamount="5" width="100%">
                    🚧 UNDER CONSTRUCTION 🚧 Welcome to the WORLD WIDE WEB! 🚧 This site is OPTIMIZED for Netscape Navigator 4.0 🚧
                  {/* @ts-expect-error marquee is deprecated but used for retro styling */}
                  </marquee>
                </span>
              </td>
            </tr>

            <tr>
              <td className="ie6-content-cell">
                {children}
              </td>
            </tr>

            <tr>
              <td className="ie6-footer-cell">
                <table width="100%" border={0} cellPadding={10}>
                  <tbody>
                    <tr>
                      <td className="ie6-footer-cell">
                        <span className="ie6-footer-link">
                          <b>
                            <a
                              href="https://github.com/skridlevsky/openchaos"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              [Click HERE to Visit Our GitHub]
                            </a>
                          </b>
                        </span>
                        <br />
                        <div style={{ marginTop: "10px" }}>
                          <Guestbook />
                          <a
                            href="https://discord.gg/6S5T5DyzZq"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="discord-chat-button"
                          >
                            <b>💬 JOIN THE CHAOS! 💬</b>
                          </a>
                          <TreeGame />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="ie6-footer-cell">
                        <span className="ie6-visitor-text">
                          {/* @ts-expect-error marquee is deprecated but used for retro styling */}
                          <marquee scrollamount="3">
                            👾 Last updated: {new Date().toLocaleDateString()} 👾 Webmaster: skridlevsky@geocities.com 👾
                          {/* @ts-expect-error marquee is deprecated but used for retro styling */}
                          </marquee>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="ie6-footer-cell">
                        <span className="ie6-warning-text">
                          <b>⚠️ WARNING: This site may cause seizures ⚠️</b>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="ie6-footer-cell" style={{ textAlign: "center", padding: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                          <a href="https://discord.gg/6S5T5DyzZq" target="_blank" rel="noopener noreferrer" title="Join our Discord!">
                            <img src="/buttons/discord88x31.gif" alt="Join OpenChaos Discord!" width="88" height="31" className="discord-button-88x31" />
                          </a>
                          <a href="https://blog.openchaos.dev/" target="_blank" rel="noopener noreferrer">
                            <img src="/buttons/2cows.gif" alt="2 Cows and a Chicken button - visit our site" width="88" height="31" />
                          </a>
                          <a href="https://blog.openchaos.dev/" target="_blank" rel="noopener noreferrer">
                            <img src="/buttons/3dkingdom.gif" alt="3D Kingdom button - visit our site" width="88" height="31" />
                          </a>
                          <a href="https://blog.openchaos.dev/" target="_blank" rel="noopener noreferrer">
                            <img src="/buttons/angelfire.gif" alt="Angelfire hosting button" width="88" height="31" />
                          </a>
                          <a href="https://blog.openchaos.dev/" target="_blank" rel="noopener noreferrer">
                            <img src="/buttons/FreewareGuide.gif" alt="Freeware Guide button" width="88" height="31" />
                          </a>
                          <a href="https://blog.openchaos.dev/" target="_blank" rel="noopener noreferrer">
                            <img src="/buttons/geocitieswww.gif" alt="GeoCities web hosting button" width="88" height="31" />
                          </a>
                          <a href="https://blog.openchaos.dev/" target="_blank" rel="noopener noreferrer">
                            <img src="/buttons/lycos.gif" alt="Lycos search engine button" width="88" height="31" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Spacer */}
        <div className="ie6-spacer"></div>

        {/* Bottom banner */}
        <table width="100%" border={1} cellPadding={5} className="ie6-bottom-banner">
          <tbody>
            <tr>
              <td className="ie6-footer-cell">
                <span className="ie6-bottom-banner-text">
                  {/* @ts-expect-error marquee is deprecated but used for retro styling */}
                  <marquee>
                    💿 Download Internet Explorer 6 NOW for the BEST browsing experience! 💿 <a href="http://www.macromedia.com/go/getflashplayer" target="_blank" rel="noopener noreferrer">Get Flash Player 6!</a> 💿 <a href="https://www.real.com/" target="_blank" rel="noopener noreferrer" className="realplayer-link">Get RealPlayer</a>! 💿
                  {/* @ts-expect-error marquee is deprecated but used for retro styling */}
                  </marquee>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </main>
      <MidiPlayer isOpen={isMidiPlayerOpen} onClose={() => setIsMidiPlayerOpen(false)} />
      <Cat isMidiPlayerOpen={isMidiPlayerOpen} />
      <StatusBar />
      <Clippy />
      </IE6BrowserChrome>
    </>
  );
}
