"use client";

import type { PullRequest, MergedPullRequest } from "@/lib/github";
import { ExpandablePRSection } from "@/components/shared/ExpandablePRSection";
import { PRCard } from "@/components/newspaper/PRCard";
import { HallOfChaosCard } from "@/components/newspaper/HallOfChaosCard";

interface NewspaperUserProfileProps {
  username: string;
  openPRs: PullRequest[];
  mergedPRs: MergedPullRequest[];
  homeHref: string;
  homeLabel: string;
}

function getBio(username: string, openCount: number, mergedCount: number): string {
  const openText = openCount === 1 ? "1 open PR" : `${openCount} open PRs`;
  const mergedText =
    mergedCount === 1 ? "1 previously merged PR" : `${mergedCount} previously merged PRs`;
  return `@${username} has ${openText} and ${mergedText}.`;
}

export function NewspaperUserProfile({
  username,
  openPRs,
  mergedPRs,
  homeHref,
  homeLabel,
}: NewspaperUserProfileProps) {
  const authorProfileHref = `${homeHref}/users/${encodeURIComponent(username)}`;
  const bio = getBio(username, openPRs.length, mergedPRs.length);

  return (
    <div className="user-profile user-profile-newspaper">
      <p style={{ marginBottom: "1em" }}>
        <a href={homeHref}>{homeLabel}</a>
      </p>
      <h1 className="user-profile-title">Articles by @{username}</h1>
      <p className="user-profile-bio">{bio}</p>

      <section className="user-profile-section" aria-label="Open pull requests">
        <h2 className="user-profile-section-title">Open PRs</h2>
        <ExpandablePRSection
          prs={openPRs}
          PRCardComponent={PRCard}
          allowDistinguish={false}
          scoreLabel="Net Score"
          emptyMessage={<p>No open PRs.</p>}
          expandLabel={(count) => `Show all (${count})`}
          collapseLabel="Show less"
        />
      </section>

      <section className="user-profile-section" aria-label="Merged pull requests">
        <h2 className="user-profile-section-title">Merged — Hall of Chaos</h2>
        {mergedPRs.length === 0 ? (
          <p>No merged PRs yet.</p>
        ) : (
          <div className="hall-container">
            {mergedPRs.map((pr) => (
              <HallOfChaosCard key={pr.number} pr={pr} authorHref={authorProfileHref} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
