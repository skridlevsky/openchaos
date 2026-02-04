import { CONSOLIDATED_TOTAL_FILE_URL } from "./constants";

function getHeaders() {
  const headers: Record<string, string> = {};
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function getCurrentCount() {
  const response = await fetch(CONSOLIDATED_TOTAL_FILE_URL, {
    headers: getHeaders(),
    next: { revalidate: 120 }, // Cache for 2 minutes
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Rate limited by GitHub API");
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }
  const count = parseInt(await response.text());
  if (Number.isNaN(count)) {
    return 0;
  }
  return count;
}
