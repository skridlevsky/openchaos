import { getOpenPRs } from '../../github';
import { GetOpenPRsInput } from '../types';

export async function getOpenPRsTool(args: GetOpenPRsInput) {
  try {
    const allPRs = await getOpenPRs();

    let filteredPRs = allPRs;

    // Apply minVotes filter if provided
    if (args.minVotes !== undefined) {
      const minVotes = args.minVotes;
      filteredPRs = filteredPRs.filter(pr => pr.votes >= minVotes);
    }

    // Apply limit
    const limitedPRs = filteredPRs.slice(0, args.limit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            total: filteredPRs.length,
            showing: limitedPRs.length,
            pullRequests: limitedPRs,
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
            error: `Failed to fetch open PRs: ${errorMessage}`,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}
