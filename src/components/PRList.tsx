'use client';

import { useEffect, useState } from 'react';
import { getOpenPRs, type PullRequest } from "@/lib/github";
import { PRCard } from "./PRCard";

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
      <div className="w-full max-w-xl text-center py-8">
        <p className="text-zinc-500">{error}</p>
        <p className="mt-2 text-sm text-zinc-600">
          Try refreshing the page in a minute.
        </p>
      </div>
    );
  }

  if (!prs || prs.length === 0) {
    return (
      <div className="w-full max-w-xl text-center py-8">
        <p className="text-zinc-400">No open PRs yet.</p>
        <p className="mt-2 text-sm text-zinc-500">
          Be the first to submit one!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl space-y-3">
      {prs.map((pr, index) => (
        <PRCard key={pr.number} pr={pr} rank={index + 1} />
      ))}
    </div>
  );
}
