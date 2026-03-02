"use client";

import type { PullRequest } from "@/lib/github";
import { hasRhymingWords } from "@/lib/rhymes";
import { TimeAgo } from "@/components/TimeAgo";
import { useVoting } from "@/hooks/useVoting";
import { useUserVote } from "@/contexts/VoteStatusContext";
import { reactionToVote } from "@/lib/votes";
import { chooseURL } from "@/lib/utils";

interface PRCardProps {
  pr: PullRequest;
  distinguishLeading?: boolean;
  scoreLabel?: string;
}

const GEOCITIES_CONFETTI_COLORS = ["#ff00ff", "#ffff00", "#00ffff", "#ff0000", "#00ff00"];

export function PRCard({ pr, distinguishLeading = true, scoreLabel = "Net" }: PRCardProps) {
  const { userVote, updateVoteStatus } = useUserVote(pr.number);
  const {
    cardRef, voteStatus, optimisticVotes, feedbackMessage, showTooltip, showShake,
    showCelebration, errorDetails, canRetry, isAuthenticated, handleVote, retryLastVote, setShowTooltip,
  } = useVoting(pr, {
    confettiColors: GEOCITIES_CONFETTI_COLORS,
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

  const cardClass = hasConflict
    ? `pr-card pr-card-normal pr-card-conflict ${isSixtySeven ? "sixseven-shake" : ""}`
    : `pr-card ${isLeading ? 'pr-card-leading' : 'pr-card-normal'} ${isSixtySeven ? "sixseven-shake" : ""}`;

  return (
    <div ref={cardRef} style={{ position: 'relative' }}>
      <table
        width="100%"
        border={2}
        cellPadding={8}
        cellSpacing={0}
        className={`${cardClass} ${showShake ? "shake-67-animation" : ""} ${showCelebration ? "celebrate-animation" : ""}`}
      >
        <tbody>
          <tr>
            <td className={isLeading ? 'pr-card-number-cell-leading' : 'pr-card-number-cell-normal'}>
              <span className={isLeading ? 'pr-card-number-text-leading' : 'pr-card-number-text-normal'}>
                <b>#{!hasConflict ? (distinguishLeading ? pr.rank : pr.number) : "N/A"}</b>
              </span>
              {isLeading && (
                <div className="pr-card-leading-badge">
                  <span className="pr-card-leading-badge-text">
                    <b>LEADING</b>
                  </span>
                </div>
              )}
              {pr.isTrending && (
                <div className="pr-card-trending-badge">
                  <span className="pr-card-trending-badge-text">
                    <b>&#128293;</b>
                  </span>
                </div>
              )}
            </td>
            <td className={isLeading ? 'pr-card-content-cell-leading' : 'pr-card-content-cell-normal'}>
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
                        </a> &middot; <TimeAgo isoDate={pr.createdAt} />
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="pr-card-link-row">
                      <a
                        href={linkHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pr-card-link"
                        suppressHydrationWarning
                      >
                        <b>[View &amp; Vote on GitHub &rarr;]</b>
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td className={isLeading ? 'pr-card-votes-cell-leading' : 'pr-card-votes-cell-normal'}>
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
                  title={userVote === "up" ? "You upvoted" : "Upvote this PR"}
                  style={{
                    opacity: voteStatus === 'voting' ? 0.6 : 1,
                    cursor: voteStatus === 'voting' ? 'wait' : 'pointer'
                  }}
                >
                  <b>{userVote === "up" ? "[\u25B2]" : "\u25B2"}</b>
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
                      borderColor: isLeading ? '#ff0000' : '#0000ff',
                      background: isLeading ? '#ffff99' : '#e6e6ff',
                      borderRadius: '3px'
                    }}
                  >
                    {voteStatus === 'voting' ? '...' : optimisticVotes}
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
                      <b>{scoreLabel}: {optimisticVotes}</b><br/>
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
                  title={userVote === "down" ? "You downvoted" : "Downvote this PR"}
                  style={{
                    opacity: voteStatus === 'voting' ? 0.6 : 1,
                    cursor: voteStatus === 'voting' ? 'wait' : 'pointer'
                  }}
                >
                  <b>{userVote === "down" ? "[\u25BC]" : "\u25BC"}</b>
                </button>

                {/* Loading Indicator */}
                {voteStatus === 'voting' && (
                  <div style={{
                    fontSize: '14px',
                    marginTop: '4px',
                    animation: 'spin 1s linear infinite'
                  }}>
                    &#9203;
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
                        onClick={retryLastVote}
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
                        &#128260; Retry
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Merge Status */}
              <div style={{ marginTop: '8px', fontSize: '11px', fontFamily: 'Arial, sans-serif' }}>
                {hasMergeIssues && (
                  <>
                    <span style={{ color: 'red', fontWeight: 'bold' }}>
                      {getMergeStatusText()}
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="green" width="16" height="16">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="red" width="16" height="16">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
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
