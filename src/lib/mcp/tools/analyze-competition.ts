import { getOpenPRs } from '../../github';

export async function analyzePRCompetitionTool() {
  try {
    const prs = await getOpenPRs();

    if (prs.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: 'No open pull requests found',
              analysis: null,
            }, null, 2),
          },
        ],
      };
    }

    // Filter to eligible PRs (mergeable and checks passed)
    const eligiblePRs = prs.filter(pr => pr.isMergeable && pr.checksPassed);

    // Get top PRs by votes
    const topPR = prs[0]; // Already sorted by votes
    const secondPR = prs[1];
    const thirdPR = prs[2];

    // Calculate vote distribution
    const totalVotes = prs.reduce((sum, pr) => sum + pr.votes, 0);
    const avgVotes = prs.length > 0 ? totalVotes / prs.length : 0;

    // Find PRs with most momentum (recent activity)
    const recentPRs = prs
      .map(pr => ({
        ...pr,
        ageInHours: (Date.now() - new Date(pr.createdAt).getTime()) / (1000 * 60 * 60),
      }))
      .sort((a, b) => {
        // Score: votes per hour (for PRs less than 48 hours old)
        const scoreA = a.ageInHours < 48 ? a.votes / Math.max(a.ageInHours, 1) : 0;
        const scoreB = b.ageInHours < 48 ? b.votes / Math.max(b.ageInHours, 1) : 0;
        return scoreB - scoreA;
      });

    // Vote margin analysis
    const voteMargins = prs.slice(0, 5).map((pr, index) => {
      const nextPR = prs[index + 1];
      return {
        pr: `#${pr.number} (${pr.votes} votes)`,
        marginToNext: nextPR ? pr.votes - nextPR.votes : null,
      };
    });

    // Competitive tiers
    const leaders = prs.filter(pr => pr.votes >= avgVotes * 1.5);
    const contenders = prs.filter(pr => pr.votes >= avgVotes && pr.votes < avgVotes * 1.5);
    const underdogs = prs.filter(pr => pr.votes < avgVotes);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            summary: {
              totalPRs: prs.length,
              eligiblePRs: eligiblePRs.length,
              totalVotes,
              averageVotes: Math.round(avgVotes * 10) / 10,
            },
            leaderboard: {
              first: topPR ? {
                number: topPR.number,
                title: topPR.title,
                author: topPR.author,
                votes: topPR.votes,
                eligible: topPR.isMergeable && topPR.checksPassed,
              } : null,
              second: secondPR ? {
                number: secondPR.number,
                title: secondPR.title,
                author: secondPR.author,
                votes: secondPR.votes,
                eligible: secondPR.isMergeable && secondPR.checksPassed,
              } : null,
              third: thirdPR ? {
                number: thirdPR.number,
                title: thirdPR.title,
                author: thirdPR.author,
                votes: thirdPR.votes,
                eligible: thirdPR.isMergeable && thirdPR.checksPassed,
              } : null,
            },
            momentum: {
              rising: recentPRs.slice(0, 3).map(pr => ({
                number: pr.number,
                title: pr.title,
                votes: pr.votes,
                ageInHours: Math.round(pr.ageInHours),
                votesPerHour: Math.round((pr.votes / Math.max(pr.ageInHours, 1)) * 10) / 10,
              })),
            },
            competition: {
              voteMargins: voteMargins.filter(m => m.marginToNext !== null),
              tiers: {
                leaders: leaders.length,
                contenders: contenders.length,
                underdogs: underdogs.length,
              },
            },
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('Rate limited')) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: 'GitHub API rate limit exceeded. Please try again later or configure a GITHUB_TOKEN.',
            }, null, 2),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: `Failed to analyze PR competition: ${errorMessage}`,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}
