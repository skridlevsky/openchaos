"use client";

import type { PullRequest } from "@/lib/github";
import { hasRhymingWords } from "@/lib/rhymes";
import { TimeAgo } from "@/components/TimeAgo";
import { useVoting } from "@/hooks/useVoting";
import { useUserVote } from "@/contexts/VoteStatusContext";
import { chooseURL } from "@/lib/utils";

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
    onVoteSuccess: (prNumber, reaction) => updateVoteStatus(prNumber, reaction === "+1" ? "up" : "down"),
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

  const voteButtonStyle = {
    opacity: voteStatus === "voting" ? 0.6 : 1,
    cursor: voteStatus === "voting" ? "wait" : "pointer",
    fontFamily: "inherit",
    background: "transparent",
    color: "var(--foreground)",
    padding: "2px 6px",
    border: "none",
  } as const;

  const cardClass = hasConflict
    ? `pr-card pr-card-normal pr-card-conflict ${isSixtySeven ? "sixseven-shake" : ""}`
    : `pr-card ${isLeading ? "pr-card-leading" : "pr-card-normal"} ${isSixtySeven ? "sixseven-shake" : ""}`;

  return (
    <div
      ref={cardRef}
      className={`${cardClass} ${showShake ? "shake-67-animation" : ""} ${showCelebration ? "celebrate-animation" : ""}`}
      style={{ position: "relative", marginBottom: "1.5em" }}
    >
      {/* Rank, optional badges, title, and PR number */}
      <div>
        <span>#{!hasConflict ? (distinguishLeading ? pr.rank : pr.number) : "N/A"}. </span>
        {isLeading && <span>[LEADING]</span>}
        {pr.isTrending && <span>[TRENDING]</span>}
        <span>{pr.title}</span>
        <span>(#{pr.number})</span>
      </div>

      {/* Vote buttons */}
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
              {scoreLabel}: {optimisticVotes} | {isAuthenticated ? "arrows to vote" : "Login to vote"}
            </span>
          )}
        </span>
        <button onClick={() => handleVote("+1")} className="vote-arrow vote-arrow-up" disabled={voteStatus === "voting"} title={userVote === "up" ? "You upvoted" : "Upvote this PR"} style={voteButtonStyle}>
          {userVote === "up" ? "[^]" : "^"}
        </button>
        <button onClick={() => handleVote("-1")} className="vote-arrow vote-arrow-down" disabled={voteStatus === "voting"} title={userVote === "down" ? "You downvoted" : "Downvote this PR"} style={voteButtonStyle}>
          {userVote === "down" ? "[v]" : "v"}
        </button>
      </div>

      {/* Line 2: by @author · time */}
      <div>
        &nbsp;&nbsp;&nbsp;&nbsp;by{" "}
        <a href={`https://github.com/${pr.author}`} target="_blank" rel="noopener noreferrer" className="pr-card-author-link">
          @{pr.author}
        </a>{" "}
        · <TimeAgo isoDate={pr.createdAt} />
      </div>

      {/* Line 3: link */}
      <div>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <a href={linkHref} target="_blank" rel="noopener noreferrer" className="pr-card-link" suppressHydrationWarning>
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
              onClick={retryLastVote}
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
