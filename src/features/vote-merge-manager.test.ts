// vote-merge-manager.test.ts

import { render, screen, waitFor } from '@testing-library/react';
import { VoteMergeManager } from './vote-merge-manager';
import { useVoting } from '../hooks/useVoting';
import { useVoteStatus } from '../hooks/useVoteStatus';

jest.mock('../hooks/useVoting');
jest.mock('../hooks/useVoteStatus');

describe('VoteMergeManager', () => {
  it('shows merging message when PR is ready for merge', async () => {
    const mockGetVotesForPR = jest.fn().mockResolvedValue([]);
    const mockIsPRReadyForMerge = jest.fn().mockReturnValue(true);
    const mockOnMergeSuccess = jest.fn();
    const mockOnMergeFailure = jest.fn();

    (useVoting as jest.Mock).mockReturnValue({ getVotesForPR: mockGetVotesForPR, isPRReadyForMerge: mockIsPRReadyForMerge });
    (useVoteStatus as jest.Mock).mockReturnValue({ getVoteStatus: jest.fn() });

    render(<VoteMergeManager prId='1' onMergeSuccess={mockOnMergeSuccess} onMergeFailure={mockOnMergeFailure} />);

    await waitFor(() => expect(mockOnMergeSuccess).toHaveBeenCalled());

    expect(screen.getByText('Merging PR...')).toBeInTheDocument();
  });

  it('shows error message when PR is not ready for merge', async () => {
    const mockGetVotesForPR = jest.fn().mockResolvedValue([]);
    const mockIsPRReadyForMerge = jest.fn().mockReturnValue(false);
    const mockOnMergeSuccess = jest.fn();
    const mockOnMergeFailure = jest.fn();

    (useVoting as jest.Mock).mockReturnValue({ getVotesForPR: mockGetVotesForPR, isPRReadyForMerge: mockIsPRReadyForMerge });
    (useVoteStatus as jest.Mock).mockReturnValue({ getVoteStatus: jest.fn() });

    render(<VoteMergeManager prId='1' onMergeSuccess={mockOnMergeSuccess} onMergeFailure={mockOnMergeFailure} />);

    await waitFor(() => expect(screen.getByText('This PR is not ready for merging based on current votes.')).toBeInTheDocument());
  });
});