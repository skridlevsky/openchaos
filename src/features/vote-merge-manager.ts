// vote-merge-manager.ts

import { useState, useEffect } from 'react';
import { useVoting } from '../hooks/useVoting';
import { useVoteStatus } from '../hooks/useVoteStatus';

interface VoteMergeManagerProps {
  prId: string;
  onMergeSuccess: () => void;
  onMergeFailure: () => void;
}

export const VoteMergeManager = ({ prId, onMergeSuccess, onMergeFailure }: VoteMergeManagerProps) => {
  const { getVotesForPR, isPRReadyForMerge } = useVoting();
  const { getVoteStatus } = useVoteStatus();
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkVotesAndMerge = async () => {
      try {
        const votes = await getVotesForPR(prId);
        const mergeReady = isPRReadyForMerge(votes);

        if (mergeReady) {
          setIsMerging(true);
          // Simulating a merge process
          setTimeout(() => {
            onMergeSuccess();
          }, 2000);
        } else {
          setError('This PR is not ready for merging based on current votes.');
        }
      } catch (err) {
        setError('Error checking votes or merging PR.');
      }
    };

    checkVotesAndMerge();
  }, [prId, getVotesForPR, isPRReadyForMerge, onMergeSuccess, onMergeFailure]);

  return (
    <div>
      {isMerging ? (
        <p>Merging PR...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <p>Waiting for votes...</p>
      )}
    </div>
  );
};