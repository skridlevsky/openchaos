"use client";

import { useState, useEffect, useRef } from "react";
import type { PullRequest } from "@/lib/github";
import { stripEmojis } from "@/lib/utils";
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
  const { isAuthenticated, login } = useAuth();
  const url = chooseURL(pr.url);

  const [voteStatus, setVoteStatus] = useState<VoteStatus>('idle');
  const [optimisticVotes, setOptimisticVotes] = useState(pr.votes);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showShake, setShowShake] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [canRetry, setCanRetry] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const lastPrVotesRef = useRef(pr.votes);
  const isOptimisticUpdateRef = useRef(false);

  // Reset optimistic votes when PR votes change from external source
  // Note: This pattern is necessary for optimistic updates - we sync props to state
  // only when the change comes from outside (not from our own optimistic update)
  useEffect(() => {
    if (!isOptimisticUpdateRef.current && pr.votes !== lastPrVotesRef.current) {
      lastPrVotesRef.current = pr.votes;
      // This setState in useEffect is intentional and necessary for syncing external
      // prop changes to optimistic state. The ref guard prevents cascading renders.
      setOptimisticVotes(pr.votes);
    }
    isOptimisticUpdateRef.current = false;
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
    isOptimisticUpdateRef.current = true;
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
        setFeedbackMessage(reaction === '+1' ? '[+] Upvoted!' : '[-] Downvoted!');

        // Check for milestones
        if (newVoteCount === 67 || newVoteCount === -67) {
          // SixSeven special!
          setShowShake(true);
          soundPlayer.playMilestone();
          createConfetti();
          setTimeout(() => setShowShake(false), 500);
        } else if (newVoteCount % 10 === 0 && Math.abs(newVoteCount) >= 10) {
          // Milestone (10, 20, 30, etc.)
          soundPlayer.playMilestone();
          createStarBurst();
        }
      } else {
        // Revert optimistic update
        setOptimisticVotes(pr.votes);
        setVoteStatus('error');
        setCanRetry(true);

        // Better error messages
        if (response.status === 429) {
          setErrorDetails('Rate limited');
          setFeedbackMessage('[!] Too many votes! Slow down.');
        } else if (response.status === 401 || response.status === 403) {
          setErrorDetails('Authentication failed');
          setFeedbackMessage('[!] Session expired. Please login again.');
        } else if (response.status === 404) {
          setErrorDetails('PR not found');
          setFeedbackMessage('[!] PR not found. Try refreshing.');
        } else {
          setErrorDetails(`Server error (${response.status})`);
          setFeedbackMessage('[!] Server error. Try again.');
        }

        soundPlayer.playError();
      }
    } catch {
      // Revert optimistic update
      setOptimisticVotes(pr.votes);
      setVoteStatus('error');
      setCanRetry(true);
      setErrorDetails('Network error');
      setFeedbackMessage('[!] Network error. Check connection.');
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

    const stars = ['*', '*', '*', '*'];
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

  const currentIsSixtySeven = optimisticVotes === 67 || optimisticVotes === -67;

  return (
    <div ref={cardRef} className={`${currentIsSixtySeven || showShake ? "sixseven-shake" : ""}`}>
      {rank}. {rank === 1 && "[LEADING]"} {stripEmojis(pr.title)} (#{pr.number})
      <br />
      &nbsp;&nbsp;&nbsp;by @{pr.author} · <TimeAgo isoDate={pr.createdAt} />
      <br />
      &nbsp;&nbsp;&nbsp;<a href={url} target="_blank" rel="noopener noreferrer">
        {pr.url}
      </a>
      <br />
      &nbsp;&nbsp;&nbsp;SCORE: {optimisticVotes}
      &nbsp;&nbsp;&nbsp;[
      <button
        onClick={() => handleVote('+1')}
        disabled={voteStatus === 'voting'}
        style={{
          background: 'none',
          border: 'none',
          cursor: voteStatus === 'voting' ? 'wait' : 'pointer',
          padding: '0 2px',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          opacity: voteStatus === 'voting' ? 0.6 : 1
        }}
        title="Upvote"
      >
        ^
      </button>
      /
      <button
        onClick={() => handleVote('-1')}
        disabled={voteStatus === 'voting'}
        style={{
          background: 'none',
          border: 'none',
          cursor: voteStatus === 'voting' ? 'wait' : 'pointer',
          padding: '0 2px',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          opacity: voteStatus === 'voting' ? 0.6 : 1
        }}
        title="Downvote"
      >
        v
      </button>
      ]
      {voteStatus === 'voting' && (
        <>
          <br />
          &nbsp;&nbsp;&nbsp;[... voting ...]
        </>
      )}
      {feedbackMessage && (
        <>
          <br />
          &nbsp;&nbsp;&nbsp;{feedbackMessage}
          {errorDetails && ` (${errorDetails})`}
          {canRetry && (
            <>
              {' '}
              <button
                onClick={() => {
                  const lastVote = localStorage.getItem('last_vote_attempt');
                  if (lastVote) {
                    const { reaction } = JSON.parse(lastVote);
                    handleVote(reaction);
                  }
                }}
                style={{
                  background: 'none',
                  border: '1px solid',
                  cursor: 'pointer',
                  padding: '1px 4px',
                  fontSize: 'inherit',
                  fontFamily: 'inherit'
                }}
              >
                [Retry]
              </button>
            </>
          )}
        </>
      )}
      {(!pr.isMergeable || !pr.checksPassed) && (
        <>
          <br />
          &nbsp;&nbsp;&nbsp;
          {!pr.isMergeable && !pr.checksPassed
            ? "Conflicts & Checks failed"
            : !pr.isMergeable
              ? "Merge conflicts"
              : "Checks failed"}
        </>
      )}
    </div>
  );
}
