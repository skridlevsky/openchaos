"use client";

import { useState, useEffect, useRef } from "react";
import type { PullRequest } from "@/lib/github";
import { useAuth } from "@/hooks/useAuth";
import { soundPlayer } from "@/utils/sounds";

export type VoteStatus = "idle" | "voting" | "success" | "error";

export interface VotingOptions {
  confettiColors?: string[];
  starBurstChars?: string[];
  useDirectionalStarBurst?: boolean;
  feedbackMessages?: {
    upvote: string;
    downvote: string;
  };
  errorMessages?: {
    rateLimited: string;
    authFailed: string;
    notFound: string;
    serverError: string;
    networkError: string;
    genericError: string;
  };
  onVoteSuccess?: (prNumber: number, reaction: "+1" | "-1") => void;
}

const DEFAULT_CONFETTI_COLORS = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
const DEFAULT_STAR_BURST_CHARS = ["\u2B50", "\u2728", "\uD83D\uDCAB", "\uD83C\uDF1F"];
const DEFAULT_FEEDBACK = { upvote: "\uD83D\uDC4D Upvoted!", downvote: "\uD83D\uDC4E Downvoted!" };
const DEFAULT_ERRORS = {
  rateLimited: "\u23F1\uFE0F Too many votes! Slow down.",
  authFailed: "\uD83D\uDD12 Session expired. Please login again.",
  notFound: "\u274C PR not found. Try refreshing.",
  serverError: "\u274C Server error. Try again.",
  networkError: "\uD83C\uDF10 Network error. Check connection.",
  genericError: "\u274C Something went wrong. Try again.",
};

export interface VotingState {
  voteStatus: VoteStatus;
  optimisticVotes: number;
  feedbackMessage: string;
  showTooltip: boolean;
  showCelebration: boolean;
  showShake: boolean;
  errorDetails: string;
  canRetry: boolean;
  cardRef: React.RefObject<HTMLDivElement | null>;
  isAuthenticated: boolean;
  handleVote: (reaction: "+1" | "-1") => Promise<void>;
  retryLastVote: () => void;
  setShowTooltip: (show: boolean) => void;
}

function playSound(fn: () => void): void {
  try { fn(); } catch (e) { console.debug("Sound playback failed (non-critical):", e); }
}

export function useVoting(pr: PullRequest, options: VotingOptions = {}): VotingState {
  const {
    confettiColors = DEFAULT_CONFETTI_COLORS,
    starBurstChars = DEFAULT_STAR_BURST_CHARS,
    useDirectionalStarBurst = false,
    feedbackMessages = DEFAULT_FEEDBACK,
    errorMessages = DEFAULT_ERRORS,
    onVoteSuccess,
  } = options;

  const { isAuthenticated, login } = useAuth();

  const [voteStatus, setVoteStatus] = useState<VoteStatus>("idle");
  const [optimisticVotes, setOptimisticVotes] = useState(pr.votes);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showShake, setShowShake] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");
  const [canRetry, setCanRetry] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Sync optimistic votes when actual votes change (React recommended pattern)
  const [prevVotes, setPrevVotes] = useState(pr.votes);
  if (prevVotes !== pr.votes) {
    setPrevVotes(pr.votes);
    setOptimisticVotes(pr.votes);
  }

  useEffect(() => {
    if (voteStatus === "success" || voteStatus === "error") {
      const timer = setTimeout(() => {
        setVoteStatus("idle");
        setFeedbackMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [voteStatus]);

  function createConfetti() {
    if (!cardRef.current) return;
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti-particle";
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = "0";
      confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      confetti.style.animationDelay = `${Math.random() * 0.3}s`;
      cardRef.current.appendChild(confetti);
      setTimeout(() => confetti.remove(), 2000);
    }
  }

  function createStarBurst() {
    if (!cardRef.current) return;
    for (let i = 0; i < 8; i++) {
      const star = document.createElement("div");
      star.className = "star-burst";
      star.textContent = starBurstChars[Math.floor(Math.random() * starBurstChars.length)];
      star.style.left = "50%";
      star.style.top = "50%";
      star.style.animationDelay = `${i * 0.1}s`;
      if (useDirectionalStarBurst) {
        const angle = (i / 8) * 2 * Math.PI;
        const distance = 30 + Math.random() * 20;
        star.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
        star.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
      }
      cardRef.current.appendChild(star);
      setTimeout(() => star.remove(), 1000);
    }
  }

  async function handleVote(reaction: "+1" | "-1") {
    if (!isAuthenticated) {
      try { localStorage.setItem("pending_vote", JSON.stringify({ prNumber: pr.number, reaction })); } catch (e) { console.debug("Could not persist pending vote:", e); }
      login();
      return;
    }

    setCanRetry(false);
    setErrorDetails("");
    try { localStorage.setItem("last_vote_attempt", JSON.stringify({ prNumber: pr.number, reaction })); } catch (e) { console.debug("Could not persist last vote attempt:", e); }

    setVoteStatus("voting");
    const optimisticDelta = reaction === "+1" ? 1 : -1;
    const newVoteCount = optimisticVotes + optimisticDelta;
    setOptimisticVotes(newVoteCount);

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prNumber: pr.number, reaction }),
      });

      if (response.ok) {
        setVoteStatus("success");
        setFeedbackMessage(reaction === "+1" ? feedbackMessages.upvote : feedbackMessages.downvote);
        try { onVoteSuccess?.(pr.number, reaction); } catch (e) { console.error("onVoteSuccess callback failed:", e); }
        
        // Record vote achievement
        try {
          const STORAGE_KEY = 'openchaos_achievements';
          const saved = localStorage.getItem(STORAGE_KEY);
          let data: any = saved ? JSON.parse(saved) : { stats: { totalVotes: 0, prsSubmitted: 0, prsWon: 0, votingStreak: 0, lastVoteDate: null, daysVoted: 0 }, achievements: [] };
          const today = new Date().toISOString().split('T')[0];
          const lastVote: string | null = data.stats.lastVoteDate;
          if (lastVote) {
            const diffDays = Math.floor((new Date(today).getTime() - new Date(lastVote).getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 0) { } else if (diffDays === 1) { data.stats.votingStreak += 1; data.stats.daysVoted += 1; } else { data.stats.votingStreak = 1; data.stats.daysVoted += 1; }
          } else { data.stats.votingStreak = 1; data.stats.daysVoted = 1; }
          data.stats.totalVotes += 1;
          data.stats.lastVoteDate = today;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) { console.debug('Could not record vote achievement:', e); }

        playSound(() => reaction === "+1" ? soundPlayer.playUpvote() : soundPlayer.playDownvote());
        playSound(() => soundPlayer.playSuccess());

        if (newVoteCount === 67 || newVoteCount === -67) {
          setShowShake(true);
          playSound(() => soundPlayer.playMilestone());
          createConfetti();
          setTimeout(() => setShowShake(false), 500);
        } else if (newVoteCount % 10 === 0 && Math.abs(newVoteCount) >= 10) {
          setShowCelebration(true);
          playSound(() => soundPlayer.playMilestone());
          createStarBurst();
          setTimeout(() => setShowCelebration(false), 600);
        }
      } else {
        setOptimisticVotes(pr.votes);
        setVoteStatus("error");
        setCanRetry(true);

        if (response.status === 429) {
          setErrorDetails("Rate limited");
          setFeedbackMessage(errorMessages.rateLimited);
        } else if (response.status === 401 || response.status === 403) {
          setErrorDetails("Authentication failed");
          setFeedbackMessage(errorMessages.authFailed);
        } else if (response.status === 404) {
          setErrorDetails("PR not found");
          setFeedbackMessage(errorMessages.notFound);
        } else {
          setErrorDetails(`Server error (${response.status})`);
          setFeedbackMessage(errorMessages.serverError);
        }
        playSound(() => soundPlayer.playError());
      }
    } catch (error) {
      console.error("Vote failed:", error);
      setOptimisticVotes(pr.votes);
      setVoteStatus("error");
      setCanRetry(true);
      const isNetworkError = error instanceof TypeError;
      setErrorDetails(isNetworkError ? "Network error" : "Unexpected error");
      setFeedbackMessage(isNetworkError ? errorMessages.networkError : errorMessages.genericError);
      playSound(() => soundPlayer.playError());
    }
  }

  function retryLastVote() {
    try {
      const lastVote = localStorage.getItem("last_vote_attempt");
      if (!lastVote) {
        setVoteStatus("error");
        setFeedbackMessage(errorMessages.genericError);
        return;
      }
      const parsed = JSON.parse(lastVote);
      if (parsed?.reaction) {
        handleVote(parsed.reaction);
      } else {
        setVoteStatus("error");
        setFeedbackMessage(errorMessages.genericError);
      }
    } catch (e) {
      console.error("Failed to parse last vote attempt:", e);
      localStorage.removeItem("last_vote_attempt");
      setVoteStatus("error");
      setFeedbackMessage(errorMessages.genericError);
    }
  }

  return {
    voteStatus,
    optimisticVotes,
    feedbackMessage,
    showTooltip,
    showCelebration,
    showShake,
    errorDetails,
    canRetry,
    cardRef,
    isAuthenticated,
    handleVote,
    retryLastVote,
    setShowTooltip,
  };
}
