// Achievement/Badge System for OpenChaos

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
  category: 'voting' | 'contributing' | 'special';
}

export interface UserStats {
  totalVotes: number;
  prsSubmitted: number;
  prsWon: number;
  votingStreak: number;
  lastVoteDate: string | null;
  daysVoted: number;
}

export interface UserAchievement extends Achievement {
  unlockedAt: string;
}

// Badge definitions
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_vote', name: 'First Chaos Vote', description: 'Cast your first vote on a PR', icon: '🗳️', category: 'voting', condition: (stats) => stats.totalVotes >= 1 },
  { id: 'voting_novice', name: 'Voting Novice', description: 'Cast 10 votes', icon: '📊', category: 'voting', condition: (stats) => stats.totalVotes >= 10 },
  { id: 'voting_enthusiast', name: 'Voting Enthusiast', description: 'Cast 50 votes', icon: '🔥', category: 'voting', condition: (stats) => stats.totalVotes >= 50 },
  { id: 'chaos_voter', name: 'Chaos Voter', description: 'Cast 100 votes', icon: '👑', category: 'voting', condition: (stats) => stats.totalVotes >= 100 },
  { id: 'streak_3', name: 'On a Streak', description: 'Vote 3 days in a row', icon: '⚡', category: 'voting', condition: (stats) => stats.votingStreak >= 3 },
  { id: 'streak_7', name: 'Week Warrior', description: 'Vote 7 days in a row', icon: '📅', category: 'voting', condition: (stats) => stats.votingStreak >= 7 },
  { id: 'first_pr', name: 'First Contribution', description: 'Submit your first PR', icon: '🎉', category: 'contributing', condition: (stats) => stats.prsSubmitted >= 1 },
  { id: 'pr_winner', name: 'PR Winner', description: 'Win a merge vote with your PR', icon: '🏆', category: 'contributing', condition: (stats) => stats.prsWon >= 1 },
  { id: 'multiple_wins', name: 'Multiple Wins', description: 'Win 3 merge votes', icon: '💎', category: 'contributing', condition: (stats) => stats.prsWon >= 3 },
  { id: 'dedicated', name: 'Dedicated Chaotic', description: 'Vote on 30 different days', icon: '🌟', category: 'special', condition: (stats) => stats.daysVoted >= 30 },
  { id: 'legend', name: 'Chaos Legend', description: 'Unlock all other achievements', icon: '🌈', category: 'special', condition: (stats) => ACHIEVEMENTS.filter(a => a.id !== 'legend' && a.condition(stats)).length >= ACHIEVEMENTS.length - 2 },
];

export function getInitialState(): UserStats {
  return { totalVotes: 0, prsSubmitted: 0, prsWon: 0, votingStreak: 0, lastVoteDate: null, daysVoted: 0 };
}

export function checkAchievements(stats: UserStats): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.condition(stats));
}

export function updateStatsForVote(stats: UserStats): UserStats {
  const today = new Date().toISOString().split('T')[0];
  const lastVote = stats.lastVoteDate;
  let newStreak = stats.votingStreak;
  let newDaysVoted = stats.daysVoted;
  
  if (lastVote) {
    const lastDate = new Date(lastVote);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) { } else if (diffDays === 1) { newStreak += 1; newDaysVoted += 1; } else { newStreak = 1; newDaysVoted += 1; }
  } else { newStreak = 1; newDaysVoted = 1; }
  
  return { ...stats, totalVotes: stats.totalVotes + 1, votingStreak: newStreak, daysVoted: newDaysVoted, lastVoteDate: today };
}
