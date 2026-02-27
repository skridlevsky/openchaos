"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useVoteStatus, type UserVote, type VoteStatusMap } from "@/hooks/useVoteStatus";

interface VoteStatusContextValue {
  voteStatusMap: VoteStatusMap;
  updateVoteStatus: (prNumber: number, status: UserVote) => void;
}

const VoteStatusContext = createContext<VoteStatusContextValue | null>(null);

export function VoteStatusProvider({ prNumbers, children }: { prNumbers: number[]; children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { voteStatusMap, updateVoteStatus } = useVoteStatus(prNumbers, isAuthenticated);

  return (
    <VoteStatusContext.Provider value={{ voteStatusMap, updateVoteStatus }}>
      {children}
    </VoteStatusContext.Provider>
  );
}

export function useUserVote(prNumber: number) {
  const ctx = useContext(VoteStatusContext);
  if (!ctx) return { userVote: null as UserVote, updateVoteStatus: (_pr: number, _status: UserVote) => {} };
  return { userVote: ctx.voteStatusMap[prNumber] ?? null, updateVoteStatus: ctx.updateVoteStatus };
}
