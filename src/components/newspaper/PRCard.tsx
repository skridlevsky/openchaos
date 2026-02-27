"use client";

import type { PullRequest } from "@/lib/github";
import { hasRhymingWords } from "@/lib/rhymes";
import { TimeAgo } from "@/components/TimeAgo";
import { useVoting } from "@/hooks/useVoting";
import { chooseURL } from "@/lib/utils";

const NEWSPAPER_VOTING_OPTIONS = {
  confettiColors: ["#8b0000", "#8b7355", "#1a1a1a", "#c4a55a", "#4a0000", "#d4c5a9"],
  starBurstChars: ["\u2605", "\u2736", "\u273B", "\u2726"],
  useDirectionalStarBurst: true,
  feedbackMessages: { upvote: "Ballot Cast: YEA", downvote: "Ballot Cast: NAY" },
  errorMessages: {
    rateLimited: "The presses are overheating! Slow down.",
    authFailed: "Press credentials expired. Please login again.",
    notFound: "Story not found. Try refreshing.",
    serverError: "Printing error. Try again.",
    networkError: "Telegraph lines down. Check connection.",
    genericError: "Something went wrong. Try again.",
  },
};

interface PRCardProps {
  pr: PullRequest;
  isBanner?: boolean;
  distinguishLeading?: boolean;
  scoreLabel?: string;
}

export function PRCard({ pr, isBanner = false, distinguishLeading = true, scoreLabel = "Net Score" }: PRCardProps) {
  const {
    cardRef, voteStatus, optimisticVotes, feedbackMessage, showTooltip, showShake,
    showCelebration, errorDetails, canRetry, isAuthenticated, handleVote, retryLastVote, setShowTooltip,
  } = useVoting(pr, NEWSPAPER_VOTING_OPTIONS);
  const linkHref = chooseURL(pr.url);
  const isSixtySeven = pr.votes === 67 || pr.votes === -67;
  const isLeading = pr.rank === 1 && distinguishLeading;
  const containsRhymes = hasRhymingWords(pr.title);
  const isIneligible = !pr.isMergeable || !containsRhymes;
  const hasMergeIssues = !pr.isMergeable || !pr.checksPassed;

  function getMergeStatusText(): string {
    if (!pr.isMergeable && !pr.checksPassed) return "Conflicts & Checks Failed";
    if (!pr.isMergeable) return containsRhymes ? "Merge Conflicts" : "No Rhyme or Reason";
    return "Checks Failed";
  }

  const ballotBox = (
    <div className="np-ballot" style={{ position: "relative" }}>
      <button onClick={() => handleVote("+1")} className="np-ballot-btn" disabled={voteStatus === "voting"} title="Cast YEA ballot">
        YEA
      </button>
      <div style={{ position: "relative" }} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
        <span className={`np-ballot-count ${isLeading ? "np-ballot-count-leading" : ""}`} style={{ transform: voteStatus === "voting" ? "scale(1.1)" : "scale(1)" }}>
          {voteStatus === "voting" ? "..." : optimisticVotes}
        </span>
        {showTooltip && (
          <div className="np-ballot-tooltip">
            <strong>{scoreLabel}: {optimisticVotes}</strong><br />
            <span>{isAuthenticated ? "Cast your ballot" : "Press credentials required"}</span>
          </div>
        )}
      </div>
      <button onClick={() => handleVote("-1")} className="np-ballot-btn" disabled={voteStatus === "voting"} title="Cast NAY ballot">
        NAY
      </button>
      {feedbackMessage && (
        <div className={`np-vote-feedback ${voteStatus === "success" ? "np-vote-feedback-success" : "np-vote-feedback-error"}`}>
          {feedbackMessage}
          {errorDetails && <span style={{ fontSize: "0.55rem", opacity: 0.8 }}> ({errorDetails})</span>}
          {canRetry && <button className="np-vote-retry" onClick={retryLastVote}>Retry</button>}
        </div>
      )}
    </div>
  );

  const animationClasses = [
    isSixtySeven && "sixseven-shake",
    showShake && "shake-67-animation",
    showCelebration && "celebrate-animation",
  ].filter(Boolean).join(" ");

  if (isBanner) {
    return (
      <div ref={cardRef} className={`np-banner ${animationClasses}`} style={{ position: "relative" }}>
        <span className="np-banner-badge">EDITOR&apos;S CHOICE</span>
        <div className="np-banner-headline">{pr.title}</div>
        <div className="np-banner-byline">
          by{" "}
          <a href={`https://github.com/${pr.author}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>@{pr.author}</a>
          {" \u00B7 "}<TimeAgo isoDate={pr.createdAt} />{" \u00B7 "}<span className="np-article-number">#{pr.number}</span>
        </div>
        <div className="np-banner-votes">{ballotBox}</div>
        <div style={{ marginTop: "8px" }}>
          <a href={linkHref} target="_blank" rel="noopener noreferrer" className="np-article-link" suppressHydrationWarning>Read Full Story &rarr;</a>
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
    <div ref={cardRef} className={`np-article ${animationClasses}`} style={{ position: "relative" }}>
      <div className="np-article-inner">
        <div className={`np-article-rank ${isIneligible ? "np-article-rank-na" : ""}`}>
          {isIneligible ? "\u2014" : distinguishLeading ? pr.rank : `#${pr.number}`}
        </div>
        <div className="np-article-content">
          <div className="np-article-headline">
            {isLeading && <span className="np-badge np-badge-editors-choice">LEADING</span>}
            {pr.isTrending && <span className="np-badge np-badge-trending">TRENDING</span>}
            {hasMergeIssues && <span className="np-badge np-badge-conflict">INELIGIBLE</span>}
            {pr.title}
          </div>
          <div className="np-article-byline">
            by{" "}
            <a href={`https://github.com/${pr.author}`} target="_blank" rel="noopener noreferrer">@{pr.author}</a>
            {" \u00B7 "}<TimeAgo isoDate={pr.createdAt} />{" \u00B7 "}<span className="np-article-number">#{pr.number}</span>
          </div>
          <a href={linkHref} target="_blank" rel="noopener noreferrer" className="np-article-link" suppressHydrationWarning>Read Full Story &rarr;</a>
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
