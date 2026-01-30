import { getOpenPRs } from '../../github';

export async function predictNextMergeTool() {
  try {
    const prs = await getOpenPRs();

    if (prs.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: 'No open pull requests found',
              nextMerge: null,
            }, null, 2),
          },
        ],
      };
    }

    // In OpenChaos, the PR with the most votes wins
    // The maintainer will fix any merge conflicts or CI issues before merging
    const likelyWinner = prs[0];

    // Calculate competition level
    const voteGap = prs[1] ? likelyWinner.votes - prs[1].votes : likelyWinner.votes;

    // Estimate timing based on vote velocity
    const prAge = (Date.now() - new Date(likelyWinner.createdAt).getTime()) / (1000 * 60 * 60); // hours
    const votesPerHour = prAge > 0 ? likelyWinner.votes / prAge : 0;

    let confidenceLevel = 'very high';
    let competitionStatus = 'dominant lead';

    if (voteGap < 15) {
      confidenceLevel = 'high';
      competitionStatus = 'clear lead';
    }
    if (voteGap < 10) {
      confidenceLevel = 'medium';
      competitionStatus = 'competitive race';
    }
    if (voteGap < 5) {
      confidenceLevel = 'low';
      competitionStatus = 'tight race';
    }

    // Get runners up
    const runnersUp = prs.slice(1, 4).map(pr => ({
      number: pr.number,
      title: pr.title,
      author: pr.author,
      votes: pr.votes,
      voteGap: likelyWinner.votes - pr.votes,
      url: pr.url,
    }));

    // Check if there are any blocking issues (if API data is available)
    const warnings = [];
    if (!likelyWinner.isMergeable) {
      warnings.push('⚠️  Has merge conflicts - merge will fail unless resolved');
    }
    if (!likelyWinner.checksPassed) {
      warnings.push('⚠️  CI checks failing');
    }

    const canMerge = likelyWinner.isMergeable;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            prediction: {
              topPRByVotes: {
                number: likelyWinner.number,
                title: likelyWinner.title,
                author: likelyWinner.author,
                votes: likelyWinner.votes,
                url: likelyWinner.url,
                createdAt: likelyWinner.createdAt,
              },
              willMergeSuccessfully: canMerge,
              confidence: confidenceLevel,
              competitionStatus,
              voteAdvantage: voteGap,
              voteMomentum: {
                votesPerHour: Math.round(votesPerHour * 100) / 100,
                ageInHours: Math.round(prAge),
              },
              warnings: warnings.length > 0 ? warnings : null,
              runnersUp,
            },
            howItWorks: 'A GitHub Action automatically merges the PR with the most +1 reactions (👍). If the top PR has merge conflicts, the merge will fail.',
            stats: {
              totalOpenPRs: prs.length,
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
            error: `Failed to predict next merge: ${errorMessage}`,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}
