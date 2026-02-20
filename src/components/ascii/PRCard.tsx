"use client";

import { useState, useEffect, useRef } from "react";
import type { PullRequest } from "@/lib/github";
import { hasRhymingWords } from "@/lib/rhymes";
import { TimeAgo } from "@/components/TimeAgo";
import { useAuth } from "@/hooks/useAuth";
import { soundPlayer } from "@/utils/sounds";

interface PRCardProps {
  pr: PullRequest;
  distinguishLeading?: boolean,
}

function chooseURL(url: string): string {
  // 10% chance to Rickroll
  if (Math.random() <= 0.10) {
    return "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  }
  return url;
}

type VoteStatus = 'idle' | 'voting' | 'success' | 'error';

export function PRCard({ pr, distinguishLeading = true }: PRCardProps) {
  const { user, isAuthenticated, login } = useAuth();
  const linkHref = chooseURL(pr.url);
  const isSixtySeven = pr.votes === 67 || pr.votes === -67;
  const isLeading = pr.rank === 1 && distinguishLeading;
  const containsRhymes = hasRhymingWords(pr.title);
  const hasConflict = !pr.isMergeable || !containsRhymes;
  const hasMergeIssues = !pr.isMergeable || !pr.checksPassed;

  function getMergeStatusText(): string {
    if (!pr.isMergeable && !pr.checksPassed) {
      return "Conflicts & Checks failed";
    }
    if (!pr.isMergeable) {
      return containsRhymes ? "Merge conflicts" : "No rhyme or reason";
    }
    return "Checks failed";
  }

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
        reaction === '+1' ? soundPlayer.playUpvote() : soundPlayer.playDownvote();
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
    : `pr-card ${isLeading ? "pr-card-leading" : "pr-card-normal"} ${isSixtySeven ? "sixseven-shake" : ""}`;

  const voteButtonStyle = {
    opacity: voteStatus === "voting" ? 0.6 : 1,
    cursor: voteStatus === "voting" ? "wait" : "pointer",
    fontFamily: "inherit",
    background: "transparent",
    color: "var(--foreground)",
    padding: "2px 6px",
    border: "none",
  } as const;

  return (
    <div
      ref={cardRef}
      className={`${cardClass} ${showShake ? "shake-67-animation" : ""} ${showCelebration ? "celebrate-animation" : ""}`}
      style={{
        position: "relative",
        marginBottom: "1.5em",
      }}
    >
      {/* Line 1: Rank · #N · Title */}
      <div>
        <span>#{!hasConflict ? pr.rank : "N/A"}. </span>

        {isLeading && (
          <span>[LEADING]</span>
        )}
        {pr.isTrending && (
          <span>[TRENDING]</span>
        )}
        <span>
          {pr.title}
        </span>
        <span>(#{pr.number})</span>
      </div>

      {/* Vote buttons on their own line */}
      <div>

        <span
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          &nbsp;&nbsp;&nbsp;&nbsp;Score:&nbsp;
          {voteStatus === "voting" ? "..." : optimisticVotes}
          {showTooltip && (
            <span
              style={{
                position: "absolute",
                bottom: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                marginBottom: "4px",
                padding: "4px 8px",
                border: "1px solid var(--foreground)",
                background: "var(--background)",
                color: "var(--foreground)",
                fontFamily: "inherit",
                fontSize: "11px",
                whiteSpace: "nowrap",
                zIndex: 1000,
              }}
            >
              Net: {optimisticVotes} | {isAuthenticated ? "arrows to vote" : "Login to vote"}
            </span>
          )}
        </span>
        <button
          onClick={() => handleVote("+1")}
          className="vote-arrow vote-arrow-up"
          disabled={voteStatus === "voting"}
          title="Upvote this PR"
          style={voteButtonStyle}
        >
          ^
        </button>
        <button
          onClick={() => handleVote("-1")}
          className="vote-arrow vote-arrow-down"
          disabled={voteStatus === "voting"}
          title="Downvote this PR"
          style={voteButtonStyle}
        >
          v
        </button>
      </div>

      {/* Line 2: by @author · time */}
      <div>
      &nbsp;&nbsp;&nbsp;&nbsp;by{" "}
        <a
          href={`https://github.com/${pr.author}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pr-card-author-link"
        >
          @{pr.author}
        </a>{" "}
        · <TimeAgo isoDate={pr.createdAt} />
      </div>

      {/* Line 3: link */}
      <div>
      &nbsp;&nbsp;&nbsp;&nbsp;<a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="pr-card-link"
          suppressHydrationWarning
        >
          {pr.url}
        </a>
      </div>

      {/* Feedback / loading */}
      {voteStatus === "voting" && (
        <div style={{ marginBottom: "4px", fontSize: "12px" }}>...</div>
      )}
      {feedbackMessage && (
        <div
          style={{
            marginBottom: "4px",
            padding: "4px 8px",
            border: "1px solid var(--foreground)",
            background: "var(--background)",
            color: "var(--foreground)",
            fontFamily: "inherit",
            fontSize: "11px",
          }}
        >
          {feedbackMessage}
          {errorDetails && (
            <span style={{ fontSize: "10px", opacity: 0.9 }}> ({errorDetails})</span>
          )}
          {canRetry && (
            <button
              onClick={() => {
                try {
                  const lastVote = localStorage.getItem("last_vote_attempt");
                  if (lastVote) {
                    const parsed = JSON.parse(lastVote);
                    if (parsed?.reaction) {
                      handleVote(parsed.reaction);
                    }
                  }
                } catch {
                  console.error('Failed to parse last vote attempt');
                  localStorage.removeItem("last_vote_attempt");
                }
              }}
              style={{
                marginLeft: "8px",
                padding: "2px 6px",
                border: "1px solid var(--foreground)",
                background: "var(--background)",
                color: "var(--foreground)",
                fontFamily: "inherit",
                fontSize: "10px",
                cursor: "pointer",
              }}
            >
              [ Retry ]
            </button>
          )}
        </div>
      )}

      {/* Merge status */}
      <div>&nbsp;&nbsp;&nbsp;&nbsp;
        {hasMergeIssues && <span>{getMergeStatusText()} </span>}
      </div>
    </div>
  );
}
