"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useVoteStatus, type UserVote, type VoteStatusMap } from "@/hooks/useVoteStatus";

interface VoteStatusContextValue {
  voteStatusMap: VoteStatusMap;
  error: string | null;
  updateVoteStatus: (prNumber: number, status: UserVote) => void;
}

const VoteStatusContext = createContext<VoteStatusContextValue | null>(null);

export function VoteStatusProvider({ prNumbers, children }: { prNumbers: number[]; children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { voteStatusMap, error, updateVoteStatus } = useVoteStatus(prNumbers, isAuthenticated);

  return (
    <VoteStatusContext.Provider value={{ voteStatusMap, error, updateVoteStatus }}>
      {children}
    </VoteStatusContext.Provider>
  );
}

export function useUserVote(prNumber: number) {
  const ctx = useContext(VoteStatusContext);
  if (!ctx) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('useUserVote called outside VoteStatusProvider — vote indicators disabled');
    }
    return { userVote: null as UserVote, error: null, updateVoteStatus: (_pr: number, _status: UserVote) => {} };
  }
  return { userVote: ctx.voteStatusMap[prNumber] ?? null, error: ctx.error, updateVoteStatus: ctx.updateVoteStatus };
}
