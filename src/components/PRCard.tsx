"use client";

import { useState, useEffect, useRef } from "react";
import type { PullRequest } from "@/lib/github";
import { hasRhymingWords } from "@/lib/rhymes";
import { TimeAgo } from "./TimeAgo";
import { useAuth } from "@/hooks/useAuth";
import { soundPlayer } from "@/utils/sounds";

interface PRCardProps {
  pr: PullRequest;
  rank: number;
}

function chooseURL(url: string): string {
  // 10% chance to Rickroll
  if (Math.random() <= 0.10) {
    return "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  }
  return url;
}

type VoteStatus = 'idle' | 'voting' | 'success' | 'error';

export function PRCard({ pr, rank }: PRCardProps) {
  const { isAuthenticated, login } = useAuth();
  const url = chooseURL(pr.url);
  const isSixtySeven = pr.votes === 67 || pr.votes === -67;
  const containsRhymes = hasRhymingWords(pr.title);
  const isLeading = rank === 1;

  const [voteStatus, setVoteStatus] = useState<VoteStatus>('idle');
  const [optimisticVotes, setOptimisticVotes] = useState(pr.votes);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showShake, setShowShake] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [canRetry, setCanRetry] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const hasConflicts = !pr.isMergeable;

  function getStatusTitle(): string {
    if (pr.isMergeable && pr.checksPassed) {
      return "All checks passed & no conflicts";
    }
    if (hasConflicts && !pr.checksPassed) {
      return containsRhymes
        ? "Merge conflicts & checks failed — will not merge"
        : "No rhyme & checks failed — will not merge";
    }
    if (hasConflicts) {
      return containsRhymes
        ? "Has merge conflicts — will not merge"
        : "No rhyme or reason — will not merge";
    }
    return "Checks pending — will still merge";
  }

  const statusTitle = getStatusTitle();

  // Reset optimistic votes when PR votes change
  useEffect(() => {
    setOptimisticVotes(pr.votes);
  }, [pr.votes]);

  // Auto-hide success/error messages
  useEffect(() => {
    if (voteStatus === 'success' || voteStatus === 'error') {
      const timer = setTimeout(() => {
        setVoteStatus('idle');
        setFeedbackMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [voteStatus]);

  const handleVote = async (reaction: '+1' | '-1') => {
    if (!isAuthenticated) {
      localStorage.setItem('pending_vote', JSON.stringify({ prNumber: pr.number, reaction }));
      login();
      return;
    }

    setCanRetry(false);
    setErrorDetails('');
    localStorage.setItem('last_vote_attempt', JSON.stringify({ prNumber: pr.number, reaction }));

    setVoteStatus('voting');
    const optimisticDelta = reaction === '+1' ? 1 : -1;
    const newVoteCount = optimisticVotes + optimisticDelta;
    setOptimisticVotes(newVoteCount);

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prNumber: pr.number, reaction }),
      });

      if (response.ok) {
        reaction === '+1' ? soundPlayer.playUpvote() : soundPlayer.playDownvote();
        soundPlayer.playSuccess();

        setVoteStatus('success');
        setFeedbackMessage(reaction === '+1' ? '👍 Upvoted!' : '👎 Downvoted!');

        if (newVoteCount === 67 || newVoteCount === -67) {
          setShowShake(true);
          soundPlayer.playMilestone();
          createConfetti();
          setTimeout(() => setShowShake(false), 500);
        } else if (newVoteCount % 10 === 0 && Math.abs(newVoteCount) >= 10) {
          setShowCelebration(true);
          soundPlayer.playMilestone();
          createStarBurst();
          setTimeout(() => setShowCelebration(false), 600);
        }
      } else {
        setOptimisticVotes(pr.votes);
        setVoteStatus('error');
        setCanRetry(true);

        if (response.status === 429) {
          setErrorDetails('Rate limited');
          setFeedbackMessage('⏱️ Too many votes! Slow down.');
        } else if (response.status === 401 || response.status === 403) {
          setErrorDetails('Authentication failed');
          setFeedbackMessage('🔒 Session expired. Please login again.');
        } else if (response.status === 404) {
          setErrorDetails('PR not found');
          setFeedbackMessage('❌ PR not found. Try refreshing.');
        } else {
          setErrorDetails(`Server error (${response.status})`);
          setFeedbackMessage('❌ Server error. Try again.');
        }

        soundPlayer.playError();
      }
    } catch (error) {
      console.error('Vote failed:', error);
      setOptimisticVotes(pr.votes);
      setVoteStatus('error');
      setCanRetry(true);
      const isNetworkError = error instanceof TypeError && String(error.message).includes('fetch');
      setErrorDetails(isNetworkError ? 'Network error' : 'Unexpected error');
      setFeedbackMessage(isNetworkError
        ? '🌐 Network error. Check connection.'
        : '❌ Something went wrong. Try again.');
      soundPlayer.playError();
    }
  };

  const createConfetti = () => {
    if (!cardRef.current) return;
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-particle';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = '0';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 0.3}s`;
      cardRef.current.appendChild(confetti);
      setTimeout(() => confetti.remove(), 2000);
    }
  };

  const createStarBurst = () => {
    if (!cardRef.current) return;
    const stars = ['⭐', '✨', '💫', '🌟'];
    for (let i = 0; i < 8; i++) {
      const star = document.createElement('div');
      star.className = 'star-burst';
      star.textContent = stars[Math.floor(Math.random() * stars.length)];
      star.style.left = '50%';
      star.style.top = '50%';
      star.style.animationDelay = `${i * 0.1}s`;
      cardRef.current.appendChild(star);
      setTimeout(() => star.remove(), 1000);
    }
  };

  return (
    <div
      ref={cardRef}
      style={{ position: 'relative' }}
      className={`pr-card ${isLeading ? 'pr-card-leading' : 'pr-card-normal'}
        ${isSixtySeven ? "sixseven-shake" : ""}
        ${isLeading ? 'pr-card-featured' : ''}
        ${showShake ? "shake-67-animation" : ""}
        ${showCelebration ? "celebrate-animation" : ""}
      `}
    >
      <div className="pr-card-inner">
        {/* Fixed-width number column */}
        <div className={`pr-card-number-section ${isLeading ? 'pr-card-number-leading' : 'pr-card-number-normal'}`}>
          <span className="pr-card-number-text">
            #{pr.number}
          </span>
          {isLeading && (
            <div className="pr-card-leading-icon" title="Currently leading — will be merged next!">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
              </svg>
            </div>
          )}
        </div>

        {/* Flexible content column */}
        <div className="pr-card-content-section">
          <div className="pr-card-title">
            {pr.title}
          </div>
          <div className="pr-card-meta">
            by{" "}
            <a
              href={`https://github.com/${pr.author}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pr-card-author-link"
            >
              @{pr.author}
            </a>
            {" · "}
            <TimeAgo isoDate={pr.createdAt} />
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="pr-card-link"
            suppressHydrationWarning
          >
            View &amp; Vote on GitHub →
          </a>
        </div>

        {/* Fixed-width votes column */}
        <div className={`pr-card-votes-section ${isLeading ? 'pr-card-votes-leading' : 'pr-card-votes-normal'}`}>
          {/* Upvote Arrow */}
          <button
            onClick={() => handleVote('+1')}
            className="vote-arrow vote-arrow-up"
            disabled={voteStatus === 'voting'}
            title="Upvote this PR"
          >
            ▲
          </button>

          {/* Vote Count */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span
              className={isLeading ? 'vote-count vote-count-leading' : 'vote-count vote-count-normal'}
              style={{
                transform: voteStatus === 'voting' ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {optimisticVotes}
            </span>
            {showTooltip && (
              <div className="vote-tooltip">
                <strong>Net Score: {optimisticVotes}</strong><br/>
                <span style={{ fontSize: '10px' }}>
                  {isAuthenticated ? 'Click arrows to vote' : 'Login required to vote'}
                </span>
              </div>
            )}
          </div>

          {/* Downvote Arrow */}
          <button
            onClick={() => handleVote('-1')}
            className="vote-arrow vote-arrow-down"
            disabled={voteStatus === 'voting'}
            title="Downvote this PR"
          >
            ▼
          </button>

          {/* Loading Indicator */}
          {voteStatus === 'voting' && (
            <div className="web2-ajax-spinner" style={{ width: 16, height: 16, borderWidth: 2, marginTop: 2 }} />
          )}

          {/* Feedback Message */}
          {feedbackMessage && (
            <div className={`vote-feedback ${voteStatus === 'success' ? 'vote-feedback-success' : 'vote-feedback-error'}`}>
              <div>{feedbackMessage}</div>
              {errorDetails && (
                <div style={{ fontSize: '9px', marginTop: '2px', opacity: 0.8 }}>
                  ({errorDetails})
                </div>
              )}
              {canRetry && (
                <button
                  className="vote-retry-button"
                  onClick={() => {
                    try {
                      const lastVote = localStorage.getItem('last_vote_attempt');
                      if (lastVote) {
                        const parsed = JSON.parse(lastVote);
                        if (parsed?.reaction) {
                          handleVote(parsed.reaction);
                        }
                      }
                    } catch (e) {
                      console.error('Failed to parse last vote attempt:', e);
                      localStorage.removeItem('last_vote_attempt');
                    }
                  }}
                >
                  🔄 Retry
                </button>
              )}
            </div>
          )}

          {/* Status icon */}
          <div
            className="pr-card-status-icon"
            title={statusTitle}
          >
            {pr.isMergeable && pr.checksPassed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#28a745"
                width="16"
                height="16"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : hasConflicts ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#e74c3c"
                width="16"
                height="16"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#e6a817"
                width="16"
                height="16"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {pr.isTrending && (
              <div className="pr-card-trending-badge">
                <span className="pr-card-trending-badge-text">
                  <b>🔥</b>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
