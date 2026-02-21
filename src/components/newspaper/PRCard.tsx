"use client";

import { useState, useEffect, useRef } from "react";
import type { PullRequest } from "@/lib/github";
import { hasRhymingWords } from "@/lib/rhymes";
import { TimeAgo } from "@/components/TimeAgo";
import { useAuth } from "@/hooks/useAuth";
import { soundPlayer } from "@/utils/sounds";

interface PRCardProps {
  pr: PullRequest;
  isBanner?: boolean;
  distinguishLeading?: boolean;
}

function chooseURL(url: string): string {
  if (Math.random() <= 0.10) {
    return "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  }
  return url;
}

type VoteStatus = "idle" | "voting" | "success" | "error";

export function PRCard({ pr, isBanner = false, distinguishLeading = true }: PRCardProps) {
  const { isAuthenticated, login } = useAuth();
  const linkHref = chooseURL(pr.url);
  const isSixtySeven = pr.votes === 67 || pr.votes === -67;
  const isLeading = pr.rank === 1 && distinguishLeading;
  const containsRhymes = hasRhymingWords(pr.title);
  const hasMergeIssues = !pr.isMergeable || !pr.checksPassed;

  function getMergeStatusText(): string {
    if (!pr.isMergeable && !pr.checksPassed) {
      return "Conflicts & Checks Failed";
    }
    if (!pr.isMergeable) {
      return containsRhymes ? "Merge Conflicts" : "No Rhyme or Reason";
    }
    return "Checks Failed";
  }

  const [voteStatus, setVoteStatus] = useState<VoteStatus>("idle");
  const [optimisticVotes, setOptimisticVotes] = useState(pr.votes);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showShake, setShowShake] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [canRetry, setCanRetry] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOptimisticVotes(pr.votes);
  }, [pr.votes]);

  useEffect(() => {
    if (voteStatus === "success" || voteStatus === "error") {
      const timer = setTimeout(() => {
        setVoteStatus("idle");
        setFeedbackMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [voteStatus]);

  const handleVote = async (reaction: "+1" | "-1") => {
    if (!isAuthenticated) {
      localStorage.setItem("pending_vote", JSON.stringify({ prNumber: pr.number, reaction }));
      login();
      return;
    }

    setCanRetry(false);
    setErrorDetails("");
    localStorage.setItem("last_vote_attempt", JSON.stringify({ prNumber: pr.number, reaction }));

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
        setFeedbackMessage(reaction === "+1" ? "Ballot Cast: YEA" : "Ballot Cast: NAY");

        try {
          if (reaction === "+1") { soundPlayer.playUpvote(); } else { soundPlayer.playDownvote(); }
          soundPlayer.playSuccess();
        } catch { /* sound is non-critical */ }

        if (newVoteCount === 67 || newVoteCount === -67) {
          setShowShake(true);
          try { soundPlayer.playMilestone(); } catch { /* sound is non-critical */ }
          createConfetti();
          setTimeout(() => setShowShake(false), 500);
        } else if (newVoteCount % 10 === 0 && Math.abs(newVoteCount) >= 10) {
          setShowCelebration(true);
          try { soundPlayer.playMilestone(); } catch { /* sound is non-critical */ }
          createStarBurst();
          setTimeout(() => setShowCelebration(false), 600);
        }
      } else {
        setOptimisticVotes(pr.votes);
        setVoteStatus("error");
        setCanRetry(true);

        if (response.status === 429) {
          setErrorDetails("Rate limited");
          setFeedbackMessage("The presses are overheating! Slow down.");
        } else if (response.status === 401 || response.status === 403) {
          setErrorDetails("Authentication failed");
          setFeedbackMessage("Press credentials expired. Please login again.");
        } else if (response.status === 404) {
          setErrorDetails("PR not found");
          setFeedbackMessage("Story not found. Try refreshing.");
        } else {
          setErrorDetails(`Server error (${response.status})`);
          setFeedbackMessage("Printing error. Try again.");
        }
        try { soundPlayer.playError(); } catch { /* sound is non-critical */ }
      }
    } catch (error) {
      console.error("Vote failed:", error);
      setOptimisticVotes(pr.votes);
      setVoteStatus("error");
      setCanRetry(true);
      const isNetworkError = error instanceof TypeError && String(error.message).includes("fetch");
      setErrorDetails(isNetworkError ? "Network error" : "Unexpected error");
      setFeedbackMessage(isNetworkError
        ? "Telegraph lines down. Check connection."
        : "Something went wrong. Try again.");
      try { soundPlayer.playError(); } catch { /* sound is non-critical */ }
    }
  };

  const createConfetti = () => {
    if (!cardRef.current) return;
    const colors = ["#8b0000", "#8b7355", "#1a1a1a", "#c4a55a", "#4a0000", "#d4c5a9"];
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti-particle";
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = "0";
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 0.3}s`;
      cardRef.current.appendChild(confetti);
      setTimeout(() => confetti.remove(), 2000);
    }
  };

  const createStarBurst = () => {
    if (!cardRef.current) return;
    const stars = ["\u2605", "\u2736", "\u273B", "\u2726"];
    for (let i = 0; i < 8; i++) {
      const star = document.createElement("div");
      star.className = "star-burst";
      star.textContent = stars[Math.floor(Math.random() * stars.length)];
      star.style.left = "50%";
      star.style.top = "50%";
      star.style.animationDelay = `${i * 0.1}s`;
      cardRef.current.appendChild(star);
      setTimeout(() => star.remove(), 1000);
    }
  };

  const ballotBox = (
    <div className="np-ballot" style={{ position: "relative" }}>
      <button
        onClick={() => handleVote("+1")}
        className="np-ballot-btn"
        disabled={voteStatus === "voting"}
        title="Cast YEA ballot"
      >
        YEA
      </button>

      <div
        style={{ position: "relative" }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span
          className={`np-ballot-count ${isLeading ? "np-ballot-count-leading" : ""}`}
          style={{ transform: voteStatus === "voting" ? "scale(1.1)" : "scale(1)" }}
        >
          {voteStatus === "voting" ? "..." : optimisticVotes}
        </span>
        {showTooltip && (
          <div className="np-ballot-tooltip">
            <strong>Net Score: {optimisticVotes}</strong><br />
            <span>{isAuthenticated ? "Cast your ballot" : "Press credentials required"}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => handleVote("-1")}
        className="np-ballot-btn"
        disabled={voteStatus === "voting"}
        title="Cast NAY ballot"
      >
        NAY
      </button>

      {feedbackMessage && (
        <div className={`np-vote-feedback ${voteStatus === "success" ? "np-vote-feedback-success" : "np-vote-feedback-error"}`}>
          {feedbackMessage}
          {errorDetails && (
            <span style={{ fontSize: "0.55rem", opacity: 0.8 }}> ({errorDetails})</span>
          )}
          {canRetry && (
            <button
              className="np-vote-retry"
              onClick={() => {
                try {
                  const lastVote = localStorage.getItem("last_vote_attempt");
                  if (lastVote) {
                    const parsed = JSON.parse(lastVote);
                    if (parsed?.reaction) {
                      handleVote(parsed.reaction);
                    }
                  }
                } catch (e) {
                  console.error("Failed to parse last vote attempt:", e);
                  localStorage.removeItem("last_vote_attempt");
                }
              }}
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (isBanner) {
    return (
      <div
        ref={cardRef}
        className={`np-banner ${isSixtySeven ? "sixseven-shake" : ""} ${showShake ? "shake-67-animation" : ""} ${showCelebration ? "celebrate-animation" : ""}`}
        style={{ position: "relative" }}
      >
        <span className="np-banner-badge">EDITOR&apos;S CHOICE</span>
        <div className="np-banner-headline">{pr.title}</div>
        <div className="np-banner-byline">
          by{" "}
          <a href={`https://github.com/${pr.author}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
            @{pr.author}
          </a>
          {" \u00B7 "}
          <TimeAgo isoDate={pr.createdAt} />
          {" \u00B7 "}
          <span className="np-article-number">#{pr.number}</span>
        </div>
        <div className="np-banner-votes">{ballotBox}</div>
        <div style={{ marginTop: "8px" }}>
          <a href={linkHref} target="_blank" rel="noopener noreferrer" className="np-article-link" suppressHydrationWarning>
            Read Full Story &rarr;
          </a>
        </div>
        {hasMergeIssues && (
          <div className="np-merge-status" style={{ justifyContent: "center", marginTop: "8px" }}>
            <span className="np-badge np-badge-conflict">{getMergeStatusText()}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`np-article ${isSixtySeven ? "sixseven-shake" : ""} ${showShake ? "shake-67-animation" : ""} ${showCelebration ? "celebrate-animation" : ""}`}
      style={{ position: "relative" }}
    >
      <div className="np-article-inner">
        <div className="np-article-content">
          <div className="np-article-headline">
            {isLeading && <span className="np-badge np-badge-editors-choice">LEADING</span>}
            {pr.isTrending && <span className="np-badge np-badge-trending">TRENDING</span>}
            {hasMergeIssues && <span className="np-badge np-badge-conflict">INELIGIBLE</span>}
            {pr.title}
          </div>
          <div className="np-article-byline">
            by{" "}
            <a href={`https://github.com/${pr.author}`} target="_blank" rel="noopener noreferrer">
              @{pr.author}
            </a>
            {" \u00B7 "}
            <TimeAgo isoDate={pr.createdAt} />
            {" \u00B7 "}
            <span className="np-article-number">#{pr.number}</span>
          </div>
          <a href={linkHref} target="_blank" rel="noopener noreferrer" className="np-article-link" suppressHydrationWarning>
            Read Full Story &rarr;
          </a>
          {hasMergeIssues && (
            <div className="np-merge-status">
              <span className="np-merge-status-text">{getMergeStatusText()}</span>
            </div>
          )}
        </div>
        {ballotBox}
      </div>
    </div>
  );
}
