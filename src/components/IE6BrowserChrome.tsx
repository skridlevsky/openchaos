"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, GitHubUser } from "@/hooks/useAuth";
import { soundPlayer } from "@/utils/sounds";

interface IE6BrowserChromeProps {
  children: ReactNode;
}

export function IE6BrowserChrome({ children }: IE6BrowserChromeProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showFavoritesPanel, setShowFavoritesPanel] = useState(false);
  const [titleText, setTitleText] = useState("OpenChaos - Microsoft Internet Explorer");
  const [hasPlayedStartup, setHasPlayedStartup] = useState(false);

  useEffect(() => {
    if (user) {
      setTitleText(`OpenChaos - logged in as ${user.login} - Microsoft Internet Explorer`);

      // Play Windows XP startup sound on successful login (once per session)
      if (!hasPlayedStartup) {
        soundPlayer.playStartup();
        setHasPlayedStartup(true);
      }
    } else {
      setTitleText("OpenChaos - Microsoft Internet Explorer");
      setHasPlayedStartup(false);
    }
  }, [user, hasPlayedStartup]);

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

  const handleSearch = () => {
    setShowSearchPanel(!showSearchPanel);
    setShowFavoritesPanel(false);
  };

  const handleFavorites = () => {
    setShowFavoritesPanel(!showFavoritesPanel);
    setShowSearchPanel(false);
  };

  return (
    <div className="ie6-browser-window">
      {/* Window Title Bar */}
      <div className="ie6-titlebar">
        <div className="ie6-titlebar-left">
          <img 
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23fff' d='M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM3.5 8a4.5 4.5 0 0 1 8.59-1.91L-2.24.75A2 2 0 1 0 8 10a2 2 0 0 0 1.85-1.23l2.24-.75A4.5 4.5 0 0 1 3.5 8z'/%3E%3C/svg%3E" 
            alt="Internet Explorer icon" 
            className="ie6-titlebar-icon"
          />
          <span className="ie6-titlebar-text">{titleText}</span>
        </div>
        <div className="ie6-titlebar-buttons">
          <button className="ie6-titlebar-button ie6-minimize">
            <span style={{ position: 'relative', top: '-2px' }}>_</span>
          </button>
          <button className="ie6-titlebar-button ie6-maximize">
            <span style={{ fontSize: '11px' }}>□</span>
          </button>
          <button className="ie6-titlebar-button ie6-close">
            <span>✕</span>
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="ie6-menubar">
        <span className="ie6-menu-item">File</span>
        <span className="ie6-menu-item">Edit</span>
        <span className="ie6-menu-item">View</span>
        <span className="ie6-menu-item">Favorites</span>
        <span className="ie6-menu-item">Tools</span>
        <span className="ie6-menu-item">Help</span>
      </div>

      {/* Navigation Toolbar */}
      <div className="ie6-toolbar">
        <div className="ie6-toolbar-buttons">
          <button className="ie6-toolbar-button" title="Back" onClick={handleBack}>
            <span className="ie6-button-icon">◀</span>
            <span className="ie6-button-label">Back</span>
          </button>
          <button className="ie6-toolbar-button" title="Forward" onClick={handleForward}>
            <span className="ie6-button-icon">▶</span>
            <span className="ie6-button-label">Forward</span>
          </button>
          <button className="ie6-toolbar-button" title="Stop">
            <span className="ie6-button-icon">✕</span>
            <span className="ie6-button-label">Stop</span>
          </button>
          <button className="ie6-toolbar-button" title="Refresh" onClick={handleRefresh}>
            <span className="ie6-button-icon">⟳</span>
            <span className="ie6-button-label">Refresh</span>
          </button>
          <button className="ie6-toolbar-button" title="Home" onClick={handleHome}>
            <span className="ie6-button-icon">🏠</span>
            <span className="ie6-button-label">Home</span>
          </button>
        </div>
        <div className="ie6-separator"></div>
        <div className="ie6-toolbar-buttons">
          <button
            className={`ie6-toolbar-button ${showSearchPanel ? 'active' : ''}`}
            title="Search"
            onClick={handleSearch}
          >
            <span className="ie6-button-icon">🔍</span>
            <span className="ie6-button-label">Search</span>
          </button>
          <button
            className={`ie6-toolbar-button ${showFavoritesPanel ? 'active' : ''}`}
            title="Favorites"
            onClick={handleFavorites}
          >
            <span className="ie6-button-icon">⭐</span>
            <span className="ie6-button-label">Favorites</span>
          </button>
          <button
            className="ie6-toolbar-button"
            title={user ? `Logout (${user.login})` : "Login with GitHub"}
            onClick={() => {
              if (user) {
                // Logout - play Windows XP shutdown sound!
                soundPlayer.playShutdown();
                // Wait for sound to play before reloading
                setTimeout(() => {
                  fetch('/api/auth/logout', { method: 'POST' })
                    .then(() => window.location.reload());
                }, 2500); // Sound duration
              } else {
                // Login - play Windows XP startup sound, redirect when done
                localStorage.setItem('oauth_login_pending', '1');
                const audio = soundPlayer.playStartup();
                const redirect = () => { window.location.href = '/api/auth/login'; };
                if (audio) {
                  audio.addEventListener('ended', redirect);
                  setTimeout(redirect, 5000); // fallback
                } else {
                  redirect();
                }
              }
            }}
          >
            <span className="ie6-button-icon">{user ? '🚪' : '🔐'}</span>
            <span className="ie6-button-label">{user ? 'Logout' : 'Login'}</span>
          </button>
        </div>
        <div className="ie6-separator"></div>
        <div style={{ 
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center'
        }}>
          {user ? (
            <img
              src={user.avatar_url}
              alt={user.login}
              title={user.login}
              className="toolbar-avatar-spin"
              style={{
                width: '32px',
                height: '32px',
                border: '1px solid #808080',
                display: 'inline-block',
                borderRadius: '50%'
              }}
            />
          ) : (
            <img
              src="/globe.svg"
              alt="Login with GitHub"
              onClick={() => {
                localStorage.setItem('oauth_login_pending', '1');
                const audio = soundPlayer.playStartup();
                const redirect = () => { window.location.href = '/api/auth/login'; };
                if (audio) {
                  audio.addEventListener('ended', redirect);
                  setTimeout(redirect, 5000); // fallback
                } else {
                  redirect();
                }
              }}
              style={{
                width: '32px',
                height: '32px',
                border: '1px solid #808080',
                backgroundColor: '#000000',
                display: 'inline-block',
                cursor: 'pointer'
              }}
              title="Login with GitHub"
            />
          )}
        </div>
      </div>

      {/* Address Bar */}
      <div className="ie6-addressbar">
        <span className="ie6-addressbar-label">Address</span>
        <div className="ie6-addressbar-input">
          <span className="ie6-addressbar-icon">🔒</span>
          <span className="ie6-addressbar-url">http://openchaos.dev</span>
        </div>
        <button className="ie6-addressbar-go">Go</button>
      </div>

      {/* Content Area with Side Panels */}
      <div className="ie6-content-wrapper">
        {/* Search Panel */}
        {showSearchPanel && (
          <div className="ie6-side-panel">
            <div className="ie6-panel-header">
              <span>Search</span>
              <button className="ie6-panel-close" onClick={() => setShowSearchPanel(false)}>✕</button>
            </div>
            <div className="ie6-panel-content">
              <p style={{ fontSize: '11px', marginBottom: '8px' }}>Find it on the web...</p>
              <input 
                type="text" 
                placeholder="Enter search terms" 
                className="ie6-search-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = e.currentTarget.value;
                    if (query) {
                      window.open(`https://www.ask.com/web?q=${encodeURIComponent(query)}`, '_blank');
                    }
                  }
                }}
              />
              <button 
                className="ie6-search-button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  const query = input?.value;
                  if (query) {
                    window.open(`https://www.ask.com/web?q=${encodeURIComponent(query)}`, '_blank');
                  }
                }}
              >
                Search
              </button>
              <div style={{ marginTop: '16px', fontSize: '11px', color: '#666' }}>
                <p><strong>Popular Search Engines:</strong></p>
                <ul style={{ listStyle: 'none', padding: '8px 0' }}>
                  <li><a href="https://www.yahoo.com" target="_blank" rel="noopener noreferrer">Yahoo</a></li>
                  <li><a href="https://www.altavista.com" target="_blank" rel="noopener noreferrer">AltaVista</a></li>
                  <li><a href="https://www.lycos.com" target="_blank" rel="noopener noreferrer">Lycos</a></li>
                  <li><a href="https://www.excite.com" target="_blank" rel="noopener noreferrer">Excite</a></li>
                  <li><a href="https://www.dogpile.com" target="_blank" rel="noopener noreferrer">Dogpile</a></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Panel */}
        {showFavoritesPanel && (
          <div className="ie6-side-panel">
            <div className="ie6-panel-header">
              <span>Favorites</span>
              <button className="ie6-panel-close" onClick={() => setShowFavoritesPanel(false)}>✕</button>
            </div>
            <div className="ie6-panel-content">
              <div className="ie6-favorites-list">
                <div className="ie6-favorite-item" onClick={() => router.push('/')}>
                  <span className="ie6-favorite-icon">🏠</span>
                  <span>OpenChaos Home</span>
                </div>
                <div className="ie6-favorite-item" onClick={() => window.open('https://github.com/bpottle/openchaos', '_blank')}>
                  <span className="ie6-favorite-icon">📁</span>
                  <span>GitHub Repository</span>
                </div>
                <div className="ie6-favorite-item" onClick={() => window.open('https://www.spacejam.com/1996/', '_blank')}>
                  <span className="ie6-favorite-icon">🏀</span>
                  <span>Space Jam!</span>
                </div>
                <div className="ie6-favorite-item" onClick={() => window.open('http://www.milliondollarhomepage.com/', '_blank')}>
                  <span className="ie6-favorite-icon">💰</span>
                  <span>Million Dollar Homepage</span>
                </div>
                <div className="ie6-favorite-item" onClick={() => window.open('https://www.zombo.com/', '_blank')}>
                  <span className="ie6-favorite-icon">⚡</span>
                  <span>Zombocom</span>
                </div>
                <div className="ie6-favorite-item ie6-favorite-discord" onClick={() => window.open('https://discord.gg/6S5T5DyzZq', '_blank')}>
                  <span className="ie6-favorite-icon">💬</span>
                  <span>OpenChaos Discord!!!</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="ie6-content-area">
          {children}
        </div>
      </div>
    </div>
  );
}
