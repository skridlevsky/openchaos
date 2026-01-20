/**
 * Chaos feature: Daily shuffling of upvote/downvote emojis
 *
 * This module provides a deterministic way to get random emojis for upvotes
 * and downvotes based on the current date. All users see the same emojis
 * for a given day.
 *
 * Uses only GitHub's available reaction emojis: +1, -1, laugh, confused, heart, hooray, rocket, eyes
 */

// GitHub's available reaction emojis
// These correspond to the reaction types available on GitHub issues/PRs
const GITHUB_REACTIONS = [
  { content: "+1", emoji: "👍" },
  { content: "-1", emoji: "👎" },
  { content: "laugh", emoji: "😄" },
  { content: "confused", emoji: "😕" },
  { content: "heart", emoji: "❤️" },
  { content: "hooray", emoji: "🎉" },
  { content: "rocket", emoji: "🚀" },
  { content: "eyes", emoji: "👀" }
];

/**
 * Seeded random number generator using mulberry32 algorithm
 * Returns a number between 0 and 1
 */
function seededRandom(seed: number): number {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

/**
 * Get a seed value based on the current date (YYYY-MM-DD)
 * This ensures the same emojis are shown for the entire day
 */
function getDailySeed(): number {
  const now = new Date();
  const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Convert date string to a numeric seed
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed = ((seed << 5) - seed) + dateString.charCodeAt(i);
    seed = seed & seed; // Convert to 32bit integer
  }

  return Math.abs(seed);
}

/**
 * Get the upvote and downvote emojis for today
 * Returns a deterministic pair of emojis based on the current date
 */
export function getDailyVoteEmojis(): {
  upvote: string;
  downvote: string;
  upvoteContent: string;
  downvoteContent: string;
} {
  const seed = getDailySeed();

  // Create two different seeds for upvote and downvote
  const upvoteSeed = seed;
  const downvoteSeed = seed + 12345;

  // Generate random indices
  const upvoteRandom = seededRandom(upvoteSeed);
  const downvoteRandom = seededRandom(downvoteSeed);

  const upvoteIndex = Math.floor(upvoteRandom * GITHUB_REACTIONS.length);
  let downvoteIndex = Math.floor(downvoteRandom * GITHUB_REACTIONS.length);

  // Ensure we don't get the same emoji for both (would be confusing!)
  if (upvoteIndex === downvoteIndex) {
    downvoteIndex = (downvoteIndex + 1) % GITHUB_REACTIONS.length;
  }

  const upvoteReaction = GITHUB_REACTIONS[upvoteIndex];
  const downvoteReaction = GITHUB_REACTIONS[downvoteIndex];

  return {
    upvote: upvoteReaction.emoji,
    downvote: downvoteReaction.emoji,
    upvoteContent: upvoteReaction.content,
    downvoteContent: downvoteReaction.content
  };
}
