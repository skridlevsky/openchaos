export interface EmojiCounts {
  "+1": number;
  "-1": number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  url: string;
  votes: number; // kept for backward compatibility, equals totalScore
  emojiCounts: EmojiCounts;
  totalScore: number;
  createdAt: string;
}

interface GitHubPR {
  number: number;
  title: string;
  html_url: string;
  user: {
    login: string;
  };
  created_at: string;
}

interface GitHubReaction {
  content: string;
}

const GITHUB_REPO = "skridlevsky/openchaos";

// Mapping of GitHub reaction types to emojis and scores
const EMOJI_MAP: Record<string, { emoji: string; score: number }> = {
  "+1": { emoji: "👍", score: 1 },
  "-1": { emoji: "👎", score: -1 },
  laugh: { emoji: "😄", score: 1 },
  hooray: { emoji: "🎉", score: 1 },
  confused: { emoji: "😕", score: -1 },
  heart: { emoji: "❤️", score: 1 },
  rocket: { emoji: "🚀", score: 1 },
  eyes: { emoji: "👀", score: -1 },
};

function getHeaders(accept: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: accept };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function getOpenPRs(): Promise<PullRequest[]> {
  const [owner, repo] = GITHUB_REPO.split("/");

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=open`,
    {
      headers: getHeaders("application/vnd.github.v3+json"),
      next: { revalidate: 300 }, // Cache for 5 minutes
    }
  );

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Rate limited by GitHub API");
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const prs: GitHubPR[] = await response.json();

  // Fetch reactions for each PR
  const prsWithVotes = await Promise.all(
    prs.map(async (pr) => {
      const { emojiCounts, totalScore } = await getPRReactions(owner, repo, pr.number);
      return {
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        url: pr.html_url,
        votes: totalScore, // kept for backward compatibility
        emojiCounts,
        totalScore,
        createdAt: pr.created_at,
      };
    }),
  );

  // Sort by total score descending
  return prsWithVotes.sort((a, b) => {
    // 1. Primary Sort: Total Score
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }

    // 2. Secondary Sort: Creation Date (Newest Wins)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

async function getPRReactions(
  owner: string,
  repo: string,
  prNumber: number,
): Promise<{ emojiCounts: EmojiCounts; totalScore: number }> {
  let allReactions: GitHubReaction[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/reactions?per_page=100&page=${page}`,
      {
        headers: getHeaders("application/vnd.github.squirrel-girl-preview+json"),
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      break;
    }

    const reactions: GitHubReaction[] = await response.json();

    if (reactions.length === 0) {
      break;
    }

    allReactions = allReactions.concat(reactions);

    if (reactions.length < 100) {
      break;
    }

    page++;
  }

  // Initialize emoji counts
  const emojiCounts: EmojiCounts = {
    "+1": 0,
    "-1": 0,
    laugh: 0,
    hooray: 0,
    confused: 0,
    heart: 0,
    rocket: 0,
    eyes: 0,
  };

  // Count each reaction type
  for (const reaction of allReactions) {
    if (reaction.content in emojiCounts) {
      emojiCounts[reaction.content as keyof EmojiCounts]++;
    }
  }

  // Calculate total score
  let totalScore = 0;
  for (const [key, count] of Object.entries(emojiCounts)) {
    const mapping = EMOJI_MAP[key];
    if (mapping) {
      totalScore += mapping.score * count;
    }
  }

  return { emojiCounts, totalScore };
}

// Export emoji map for use in components
export const EMOJI_MAP_EXPORTED = EMOJI_MAP;
