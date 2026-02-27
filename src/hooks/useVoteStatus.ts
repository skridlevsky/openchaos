"use client";

import { useState, useEffect, useCallback } from 'react';
import type { UserVote, VoteStatusMap } from '@/lib/votes';

export type { UserVote, VoteStatusMap } from '@/lib/votes';
export { reactionToVote } from '@/lib/votes';

export function useVoteStatus(prNumbers: number[], isAuthenticated: boolean) {
  const [voteStatusMap, setVoteStatusMap] = useState<VoteStatusMap>({});
  const [error, setError] = useState<string | null>(null);

  const prsKey = prNumbers.toSorted((a, b) => a - b).join(',');

  useEffect(() => {
    if (!isAuthenticated || !prsKey) {
      setVoteStatusMap({});
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchVoteStatus(): Promise<void> {
      setError(null);
      try {
        const response = await fetch(`/api/vote-status?prs=${prsKey}`);
        if (!response.ok) {
          if (!cancelled) {
            setError(response.status === 401 ? 'auth' : `HTTP ${response.status}`);
          }
          return;
        }
        const data = await response.json();
        if (!cancelled) {
          if (data.votes && typeof data.votes === 'object' && !Array.isArray(data.votes)) {
            setVoteStatusMap(data.votes);
          } else {
            console.error('Vote status API returned unexpected shape:', data);
            setError('Unexpected response format');
          }
        }
      } catch (error) {
        console.error('Failed to fetch vote status:', error);
        if (!cancelled) setError('network');
      }
    }

    fetchVoteStatus();

    return () => { cancelled = true; };
  }, [prsKey, isAuthenticated]);

  const updateVoteStatus = useCallback((prNumber: number, status: UserVote) => {
    setVoteStatusMap(prev => ({ ...prev, [prNumber]: status }));
  }, []);

  return { voteStatusMap, error, updateVoteStatus };
}
