export type UserVote = 'up' | 'down' | null;
export type VoteStatusMap = Record<number, UserVote>;

export function reactionToVote(reaction: '+1' | '-1'): 'up' | 'down' {
  return reaction === '+1' ? 'up' : 'down';
}
