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

function chooseURL(url: string) {
  // 10% chance to Rickroll
  if (Math.random() <= 0.10) {
    // Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)
    return "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  } else {
    return url;
  }
}

type VoteStatus = 'idle' | 'voting' | 'success' | 'error';

export function PRCard({ pr, rank }: PRCardProps) {
  const { user, isAuthenticated, login } = useAuth();
  const url = chooseURL(pr.url);
  const isSixtySeven = pr.votes === 67 || pr.votes === -67;
  const containsRhymes = hasRhymingWords(pr.title);
  const hasConflict = !pr.isMergeable || !containsRhymes;

  const [voteStatus, setVoteStatus] = useState<VoteStatus>('idle');
  const [optimisticVotes, setOptimisticVotes] = useState(pr.votes);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showShake, setShowShake] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [canRetry, setCanRetry] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

    // Reset error state
    setCanRetry(false);
    setErrorDetails('');

    // Store vote attempt for retry
    localStorage.setItem('last_vote_attempt', JSON.stringify({ prNumber: pr.number, reaction }));

    // Optimistic update
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
        // Success! Play sound
        if (reaction === '+1') {
          soundPlayer.playUpvote();
        } else {
          soundPlayer.playDownvote();
        }
        soundPlayer.playSuccess();

        setVoteStatus('success');
        setFeedbackMessage(reaction === '+1' ? '👍 Upvoted!' : '👎 Downvoted!');

        // Check for milestones
        if (newVoteCount === 67 || newVoteCount === -67) {
          // SixSeven special!
          setShowShake(true);
          soundPlayer.playMilestone();
          createConfetti();
          setTimeout(() => setShowShake(false), 500);
        } else if (newVoteCount % 10 === 0 && Math.abs(newVoteCount) >= 10) {
          // Milestone (10, 20, 30, etc.)
          setShowCelebration(true);
          soundPlayer.playMilestone();
          createStarBurst();
          setTimeout(() => setShowCelebration(false), 600);
        }
      } else {
        // Revert optimistic update
        setOptimisticVotes(pr.votes);
        setVoteStatus('error');
        setCanRetry(true);

        // Better error messages
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
      // Revert optimistic update
      setOptimisticVotes(pr.votes);
      setVoteStatus('error');
      setCanRetry(true);
      setErrorDetails('Network error');
      setFeedbackMessage('🌐 Network error. Check connection.');
      soundPlayer.playError();
    }
  };

  // Create confetti particles
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

  // Create star burst effect
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

  const cardClass = hasConflict
    ? `pr-card pr-card-normal pr-card-conflict ${isSixtySeven ? "sixseven-shake" : ""}`
    : `pr-card ${rank === 1 ? 'pr-card-leading' : 'pr-card-normal'} ${isSixtySeven ? "sixseven-shake" : ""}`;

  return (
    <div ref={cardRef} style={{ position: 'relative' }}>
      <table
        width="100%"
        border={2}
        cellPadding={8}
        cellSpacing={0}
        className={`${cardClass}
          ${showShake ? "shake-67-animation" : ""}
          ${showCelebration ? "celebrate-animation" : ""}
        `}
      >
      <tbody>
        <tr>
          <td className={rank === 1 ? 'pr-card-number-cell-leading' : 'pr-card-number-cell-normal'}>
            <span className={rank === 1 ? 'pr-card-number-text-leading' : 'pr-card-number-text-normal'}>
              <b>#{pr.number}</b>
            </span>
            {rank === 1 && (
              <div className="pr-card-leading-badge">
                <span className="pr-card-leading-badge-text">
                  <b>LEADING</b>
                </span>
              </div>
            )}
            {pr.isTrending && (
              <div className="pr-card-trending-badge">
                <span className="pr-card-trending-badge-text">
                  <b>🔥</b>
                </span>
              </div>
            )}
          </td>
          <td className={rank === 1 ? 'pr-card-content-cell-leading' : 'pr-card-content-cell-normal'}>
            <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td>
                    <span className="pr-card-title">
                      <b>{pr.title}</b>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="pr-card-author-row">
                    <span className="pr-card-author-text">
                      by <a
                        href={`https://github.com/${pr.author}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pr-card-author-link"
                      >
                        <b>@{pr.author}</b>
                      </a> · <TimeAgo isoDate={pr.createdAt} />
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="pr-card-link-row">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pr-card-link"
                    >
                      <b>[View &amp; Vote on GitHub →]</b>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
          <td className={rank === 1 ? 'pr-card-votes-cell-leading' : 'pr-card-votes-cell-normal'}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              position: 'relative'
            }}>
              {/* Upvote Arrow */}
              <button
                onClick={() => handleVote('+1')}
                className="vote-arrow vote-arrow-up"
                disabled={voteStatus === 'voting'}
                title="Upvote this PR"
                style={{
                  opacity: voteStatus === 'voting' ? 0.6 : 1,
                  cursor: voteStatus === 'voting' ? 'wait' : 'pointer'
                }}
              >
                <b>▲</b>
              </button>

              {/* Vote Count */}
              <div
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <span
                  className={rank === 1 ? 'vote-count vote-count-leading' : 'vote-count vote-count-normal'}
                  style={{
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                    transform: voteStatus === 'voting' ? 'scale(1.15)' : 'scale(1)',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    fontFamily: 'Arial, sans-serif',
                    padding: '4px 8px',
                    minWidth: '40px',
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: rank === 1 ? '#ff0000' : '#0000ff',
                    background: rank === 1 ? '#ffff99' : '#e6e6ff',
                    borderRadius: '3px'
                  }}
                >
                  {optimisticVotes}
                </span>
                {showTooltip && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#FFFFCC',
                    border: '2px solid #000',
                    padding: '6px 10px',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    boxShadow: '3px 3px 0px #000',
                    marginBottom: '8px',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    <b>Net Score: {optimisticVotes}</b><br/>
                    <span style={{ fontSize: '10px' }}>
                      {isAuthenticated ? 'Click arrows to vote' : '⚠️ Login required to vote'}
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
                style={{
                  opacity: voteStatus === 'voting' ? 0.6 : 1,
                  cursor: voteStatus === 'voting' ? 'wait' : 'pointer'
                }}
              >
                <b>▼</b>
              </button>

              {/* Loading Indicator */}
              {voteStatus === 'voting' && (
                <div style={{
                  fontSize: '14px',
                  marginTop: '4px',
                  animation: 'spin 1s linear infinite'
                }}>
                  ⏳
                </div>
              )}

              {/* Feedback Message */}
              {feedbackMessage && (
                <div style={{
                  marginTop: '8px',
                  padding: '6px 10px',
                  backgroundColor: voteStatus === 'success' ? '#90EE90' : '#FFB6C1',
                  border: '2px solid ' + (voteStatus === 'success' ? '#006400' : '#8B0000'),
                  fontSize: '11px',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold',
                  animation: 'fadeIn 0.3s ease',
                  boxShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                  borderRadius: '3px',
                  textAlign: 'center',
                  minWidth: '100px'
                }}>
                  <div>{feedbackMessage}</div>
                  {errorDetails && (
                    <div style={{ fontSize: '9px', marginTop: '4px', opacity: 0.8 }}>
                      ({errorDetails})
                    </div>
                  )}
                  {canRetry && (
                    <button
                      onClick={() => {
                        const lastVote = localStorage.getItem('last_vote_attempt');
                        if (lastVote) {
                          const { reaction } = JSON.parse(lastVote);
                          handleVote(reaction);
                        }
                      }}
                      style={{
                        marginTop: '6px',
                        padding: '3px 8px',
                        border: '1px solid',
                        borderColor: '#ffffff #000000 #000000 #ffffff',
                        background: '#c0c0c0',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      🔄 Retry
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Merge Status */}
            <div style={{ marginTop: '8px', fontSize: '11px', fontFamily: 'Arial, sans-serif' }}>
              {(!pr.isMergeable || !pr.checksPassed) && (
                <>
                  <span style={{ color: 'red', fontWeight: 'bold' }}>
                    {!pr.isMergeable && !pr.checksPassed
                      ? "Conflicts & Checks failed"
                      : !pr.isMergeable
                        ? (containsRhymes ? "Merge conflicts" : "No rhyme or reason")
                        : "Checks failed"}
                  </span>
                  <br />
                </>
              )}
              <div
                title={
                  pr.isMergeable && pr.checksPassed
                    ? "All checks passed & no conflicts"
                    : "Checks failed or has conflicts"
                }
                style={{
                  display: 'inline-block',
                  border: '1px solid #808080',
                  padding: '2px',
                  backgroundColor: 'white',
                  marginTop: '2px'
                }}
              >
                {pr.isMergeable && pr.checksPassed ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="green"
                    width="16"
                    height="16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="red"
                    width="16"
                    height="16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    </div>
  );
}
