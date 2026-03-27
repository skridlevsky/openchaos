"use client";

import type { PullRequest } from "@/lib/github";
import { hasRhymingWords } from "@/lib/rhymes";
import { TimeAgo } from "./TimeAgo";
import { useVoting } from "@/hooks/useVoting";
import { useUserVote } from "@/contexts/VoteStatusContext";
import { reactionToVote } from "@/lib/votes";
import { chooseURL } from "@/lib/utils";

interface PRCardProps {
  pr: PullRequest;
  distinguishLeading?: boolean;
  scoreLabel?: string;
}

export function PRCard({ pr, distinguishLeading = true, scoreLabel = "Net Score" }: PRCardProps) {
  const { userVote, updateVoteStatus } = useUserVote(pr.number);
  const {
    cardRef, voteStatus, optimisticVotes, feedbackMessage, showTooltip, showShake,
    showCelebration, errorDetails, canRetry, isAuthenticated, handleVote, retryLastVote, setShowTooltip,
  } = useVoting(pr, {
    onVoteSuccess: (prNumber, reaction) => updateVoteStatus(prNumber, reactionToVote(reaction)),
  });
  const url = chooseURL(pr.url);
  const isSixtySeven = pr.votes === 67 || pr.votes === -67;
  const containsRhymes = hasRhymingWords(pr.title);
  const isLeading = pr.rank === 1 && distinguishLeading;

  const hasConflicts = !pr.isMergeable;
  const isIneligible = !pr.isMergeable || !containsRhymes;

  function getStatusTitle(): string {
    if (pr.isMergeable && pr.checksPassed) return "All checks passed & no conflicts";
    if (hasConflicts && !pr.checksPassed) {
      return containsRhymes ? "Merge conflicts & checks failed — will not merge" : "No rhyme & checks failed — will not merge";
    }
    if (hasConflicts) return containsRhymes ? "Has merge conflicts — will not merge" : "No rhyme or reason — will not merge";
    return "Checks pending — will not merge until passed";
  }

  const statusTitle = getStatusTitle();

  return (
    <div
      ref={cardRef}
      style={{ position: "relative" }}
      className={`pr-card ${isLeading ? "pr-card-leading" : "pr-card-normal"}
        ${isSixtySeven ? "sixseven-shake" : ""}
        ${isLeading ? "pr-card-featured" : ""}
        ${showShake ? "shake-67-animation" : ""}
        ${showCelebration ? "celebrate-animation" : ""}
      `.trim()}
    >
      <div className="pr-card-inner">
        {/* Fixed-width number column */}
        <div className={`pr-card-number-section ${isLeading ? "pr-card-number-leading" : "pr-card-number-normal"}`}>
          <span className={`pr-card-number-text ${isIneligible ? "pr-card-number-text-na" : ""}`}>
            {isIneligible ? "N/A" : distinguishLeading ? `#${pr.rank}` : `#${pr.number}`}
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
          <div className="pr-card-title">{pr.title}</div>
          <div className="pr-card-meta">
            by{" "}
            <a href={`https://github.com/${pr.author}`} target="_blank" rel="noopener noreferrer" className="pr-card-author-link">
              @{pr.author}
            </a>
            {" · "}
            <TimeAgo isoDate={pr.createdAt} />
          </div>
          {pr.pitch && (
            <div className="pr-card-pitch" title="Author's pitch">
              💬 <em>{pr.pitch}</em>
            </div>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="pr-card-link"
            suppressHydrationWarning
          >
          <a href={url} target="_blank" rel="noopener noreferrer" className="pr-card-link" suppressHydrationWarning>
            View &amp; Vote on GitHub →
          </a>
        </div>

        {/* Fixed-width votes column */}
        <div className={`pr-card-votes-section ${isLeading ? "pr-card-votes-leading" : "pr-card-votes-normal"}`}>
          <button onClick={() => handleVote("+1")} className={`vote-arrow vote-arrow-up ${userVote === "up" ? "vote-arrow-active" : ""}`} disabled={voteStatus === "voting"} title={userVote === "up" ? "You upvoted" : "Upvote this PR"}>
            ▲
          </button>

          <div style={{ position: "relative" }} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
            <span
              className={isLeading ? "vote-count vote-count-leading" : "vote-count vote-count-normal"}
              style={{ transform: voteStatus === "voting" ? "scale(1.1)" : "scale(1)" }}
            >
              {optimisticVotes}
            </span>
            {showTooltip && (
              <div className="vote-tooltip">
                <strong>{scoreLabel}: {optimisticVotes}</strong><br />
                <span style={{ fontSize: "10px" }}>
                  {isAuthenticated ? "Click arrows to vote" : "Login required to vote"}
                </span>
              </div>
            )}
          </div>

          <button onClick={() => handleVote("-1")} className={`vote-arrow vote-arrow-down ${userVote === "down" ? "vote-arrow-active" : ""}`} disabled={voteStatus === "voting"} title={userVote === "down" ? "You downvoted" : "Downvote this PR"}>
            ▼
          </button>

          {voteStatus === "voting" && (
            <div className="web2-ajax-spinner" style={{ width: 16, height: 16, borderWidth: 2, marginTop: 2 }} />
          )}

          {feedbackMessage && (
            <div className={`vote-feedback ${voteStatus === "success" ? "vote-feedback-success" : "vote-feedback-error"}`}>
              <div>{feedbackMessage}</div>
              {errorDetails && (
                <div style={{ fontSize: "9px", marginTop: "2px", opacity: 0.8 }}>({errorDetails})</div>
              )}
              {canRetry && (
                <button className="vote-retry-button" onClick={retryLastVote}>
                  🔄 Retry
                </button>
              )}
            </div>
          )}

          {/* Status icon */}
          <div className="pr-card-status-icon" title={statusTitle}>
            {pr.isMergeable && pr.checksPassed ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#28a745" width="16" height="16">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : hasConflicts ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#e74c3c" width="16" height="16">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#e6a817" width="16" height="16">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {pr.isTrending && (
              <div className="pr-card-trending-badge">
                <span className="pr-card-trending-badge-text"><b>🔥</b></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
