"use client";

import type { PullRequest } from "@/lib/github";
import { hasRhymingWords } from "@/lib/rhymes";
import { TimeAgo } from "@/components/TimeAgo";
import { useVoting } from "@/hooks/useVoting";
import { useUserVote } from "@/contexts/VoteStatusContext";
import { reactionToVote } from "@/lib/votes";
import { chooseURL } from "@/lib/utils";

const VAPORWAVE_VOTING_OPTIONS = {
  confettiColors: ["#ff71ce", "#01cdfe", "#b967ff", "#fffb96", "#ff00aa", "#05ffa1"],
  starBurstChars: ["\u2605", "\u2726", "\u2727", "\u2738", "\u273A", "\u2756"],
  useDirectionalStarBurst: true,
  feedbackMessages: {
    upvote: "vibrations amplified",
    downvote: "signal dampened",
  },
  errorMessages: {
    rateLimited: "too many vibes \u2014 cool down",
    authFailed: "session expired \u2014 log in again",
    notFound: "PR vanished into the void",
    serverError: "server glitch \u2014 try again",
    networkError: "lost connection to the grid",
    genericError: "something broke in the matrix",
  },
};

interface PRCardProps {
  pr: PullRequest;
  distinguishLeading?: boolean;
  scoreLabel?: string;
}

export function PRCard({ pr, distinguishLeading = true, scoreLabel = "Net" }: PRCardProps) {
  const { userVote, updateVoteStatus } = useUserVote(pr.number);
  const {
    cardRef, voteStatus, optimisticVotes, feedbackMessage, showTooltip, showShake,
    showCelebration, errorDetails, canRetry, isAuthenticated, handleVote, retryLastVote, setShowTooltip,
  } = useVoting(pr, {
    ...VAPORWAVE_VOTING_OPTIONS,
    onVoteSuccess: (prNumber, reaction) => updateVoteStatus(prNumber, reactionToVote(reaction)),
  });

  const linkHref = chooseURL(pr.url);
  const isSixtySeven = pr.votes === 67 || pr.votes === -67;
  const isLeading = pr.rank === 1 && distinguishLeading;
  const containsRhymes = hasRhymingWords(pr.title);
  const hasConflict = !pr.isMergeable || !containsRhymes;
  const hasMergeIssues = !pr.isMergeable || !pr.checksPassed;

  function getMergeStatusText(): string {
    if (!pr.isMergeable && !pr.checksPassed) return "Conflicts & Checks failed";
    if (!pr.isMergeable) return containsRhymes ? "Merge conflicts" : "No rhyme or reason";
    return "Checks failed";
  }

  const cardClass = [
    "vw-card",
    hasConflict ? "vw-card-conflict" : "",
    isLeading && !hasConflict ? "vw-card-leading" : "",
    isSixtySeven ? "sixseven-shake" : "",
    showShake ? "shake-67-animation" : "",
    showCelebration ? "celebrate-animation" : "",
  ].filter(Boolean).join(" ");

  return (
    <div ref={cardRef} className={cardClass} style={{ position: "relative" }}>
      <div className="vw-card-header">
        <div className="vw-card-rank">
          {hasConflict ? "\u2013" : (distinguishLeading ? pr.rank : pr.number)}
        </div>
        <div className="vw-card-title-area">
          <div className="vw-card-title">
            {isLeading && <span className="vw-badge vw-badge-leading">Leading</span>}
            {pr.isTrending && <span className="vw-badge vw-badge-trending">Trending</span>}
            <a href={linkHref} target="_blank" rel="noopener noreferrer" suppressHydrationWarning>
              {pr.title}
            </a>
            <span className="vw-card-pr-num">#{pr.number}</span>
          </div>
          <div className="vw-card-meta">
            <a href={`https://github.com/${pr.author}`} target="_blank" rel="noopener noreferrer">
              @{pr.author}
            </a>
            {" \u00b7 "}
            <TimeAgo isoDate={pr.createdAt} />
            {hasMergeIssues && (
              <span className="vw-badge vw-badge-conflict" style={{ marginLeft: "8px" }}>
                {getMergeStatusText()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="vw-vote-area">
        <button
          onClick={() => handleVote("+1")}
          className={`vw-vote-btn ${userVote === "up" ? "vw-vote-btn-active-up" : ""}`}
          disabled={voteStatus === "voting"}
          title={userVote === "up" ? "You upvoted" : "Upvote this PR"}
        >
          {"\u25B2"}
        </button>

        <div
          className="vw-vote-score"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {voteStatus === "voting" ? "\u2026" : optimisticVotes}
          {showTooltip && (
            <div className="vw-tooltip">
              {scoreLabel}: {optimisticVotes} | {isAuthenticated ? "click arrows to vote" : "Login to vote"}
            </div>
          )}
        </div>

        <button
          onClick={() => handleVote("-1")}
          className={`vw-vote-btn ${userVote === "down" ? "vw-vote-btn-active-down" : ""}`}
          disabled={voteStatus === "voting"}
          title={userVote === "down" ? "You downvoted" : "Downvote this PR"}
        >
          {"\u25BC"}
        </button>

        <span className="vw-vote-label">{scoreLabel}</span>
      </div>

      {feedbackMessage && (
        <div className="vw-feedback">
          {feedbackMessage}
          {errorDetails && (
            <span style={{ opacity: 0.7, fontSize: "0.75rem" }}> ({errorDetails})</span>
          )}
          {canRetry && (
            <button onClick={retryLastVote} className="vw-feedback-retry">
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
