import { getMergedPRs } from '../../github';
import { GetMergedPRsInput } from '../types';

export async function getMergedPRsTool(args: GetMergedPRsInput) {
  try {
    const allMergedPRs = await getMergedPRs();

    // Apply limit
    const limitedPRs = allMergedPRs.slice(0, args.limit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            total: allMergedPRs.length,
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
            error: `Failed to fetch merged PRs: ${errorMessage}`,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}
