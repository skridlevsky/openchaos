'use client';

import { useEffect, useState } from 'react';
import { getOpenPRs, type PullRequest } from "@/lib/github";
import { ExpandablePRSection } from "./ExpandablePRSection";

export function PRList() {
  const [prs, setPrs] = useState<PullRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPRs() {
      try {
        const data = await getOpenPRs();
        setPrs(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch PRs");
      } finally {
        setLoading(false);
      }
    }

    fetchPRs();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-xl text-center py-8">
        <p className="text-zinc-500">Loading PRs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <table width="90%" border={1} cellPadding={10} className="page-error-table">
        <tbody>
          <tr>
            <td className="page-error-cell">
              <b>{error}</b>
              <br />
              <span>Try refreshing the page in a minute.</span>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  const allPRs = prs ?? [];

  if (allPRs.length === 0) {
    return (
      <table width="90%" border={1} cellPadding={10} className="page-empty-table">
        <tbody>
          <tr>
            <td className="page-empty-cell">
              <b>No open PRs yet.</b>
              <br />
              <span>Be the first to submit one!</span>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  // Split into top by votes and trending (same logic as getOrganizedPRs)
  const topByVotes = [...allPRs].sort((a, b) => {
    if (a.isMergeable !== b.isMergeable) return a.isMergeable ? -1 : 1;
    if (b.votes !== a.votes) return b.votes - a.votes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const top10Numbers = new Set(topByVotes.slice(0, 10).map(pr => pr.number));

  const trending = [...allPRs]
    .filter(pr => !top10Numbers.has(pr.number))
    .sort((a, b) => {
      if (a.isMergeable !== b.isMergeable) return a.isMergeable ? -1 : 1;
      if (b.hotScore !== a.hotScore) return b.hotScore - a.hotScore;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <>
      <ExpandablePRSection title="TOP 10 BY VOTES" prs={topByVotes} allowDistinguish />
      <ExpandablePRSection title="TRENDING THIS WEEK" prs={trending} />
    </>
  );
}
