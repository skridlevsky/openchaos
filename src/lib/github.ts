import { loadWasm } from "@/lib/wasm";
import { unstable_cache } from "next/cache";

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  url: string;
  votes: number;
  createdAt: string;
}

const GITHUB_REPO = "skridlevsky/openchaos";
const REVALIDATE_SECONDS = 300;

const getOpenPRsCached = unstable_cache(
  async () => {
    const wasm = await loadWasm();
    return (await wasm.get_open_prs(GITHUB_REPO)) as PullRequest[];
  },
  ["open-prs", GITHUB_REPO],
  { revalidate: REVALIDATE_SECONDS }
);

export async function getOpenPRs(): Promise<PullRequest[]> {
  return getOpenPRsCached();
}
