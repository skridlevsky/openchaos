"use client";

import { useState, useEffect, useRef } from 'react';

export interface GitHubUser {
  login: string;
  avatar_url: string;
}

export function useAuth() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const prevUserRef = useRef<GitHubUser | null>(null);

  useEffect(() => {
    const getUserFromCookie = () => {
      const cookies = document.cookie.split(';').map(c => c.trim());
      const userCookie = cookies.find(c => c.startsWith('github_user='));

      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie.substring('github_user='.length)));
          const prevUser = prevUserRef.current;
          
              if (!prevUser && userData) {
            if (localStorage.getItem('oauth_login_pending')) {
              localStorage.removeItem('oauth_login_pending');
              try {
                const audio = new Audio('/sounds/dialup.ogg');
                audio.volume = 0.6;
                audio.loop = false;
                const playPromise = audio.play();
                if (playPromise) {
                  playPromise.catch(() => {
                    // Autoplay blocked - play on first user interaction
                    const playOnInteraction = () => {
                      audio.play().catch(() => {});
                      document.removeEventListener('click', playOnInteraction);
                      document.removeEventListener('keydown', playOnInteraction);
                    };
                    document.addEventListener('click', playOnInteraction, { once: true });
                    document.addEventListener('keydown', playOnInteraction, { once: true });
                  });
                }
                audio.addEventListener('ended', () => {
                  audio.remove();
                });
              } catch {}
            }
            const pendingVote = localStorage.getItem('pending_vote');
            if (pendingVote) {
              try {
                const { prNumber, reaction } = JSON.parse(pendingVote);
                localStorage.removeItem('pending_vote');
                fetch('/api/vote', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prNumber, reaction }),
                }).then(() => {
                  // Vote cast successfully - no reload needed!
                  console.log('✅ Pending vote cast successfully');
                }).catch(() => console.error('Failed to cast pending vote'));
              } catch (e) {
                console.error('Failed to parse pending vote', e);
                localStorage.removeItem('pending_vote');
              }
            }
          }
          
          prevUserRef.current = userData;
          setUser(userData);
        } catch (e) {
          console.error('Failed to parse user cookie', e);
        }
      } else {
        prevUserRef.current = null;
        setUser(null);
      }

      setLoading(false);
    };

    getUserFromCookie();

    const interval = setInterval(() => {
      getUserFromCookie();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const login = () => {
    localStorage.setItem('oauth_login_pending', '1');
    try {
      const audio = new Audio('/sounds/xp-startup.mp3');
      audio.play().catch(() => {});
    } catch {}
    window.location.href = '/api/auth/login';
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    localStorage.removeItem('pending_vote');
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
}
