import {PullRequest} from "@/lib/github";

export class PRRankingSystem {
  private prRequests: PullRequest[];
  private prsClosedByUser: { [p: string]: PullRequest[] };

  constructor(prRequests: PullRequest[], prsClosedByUser: { [user: string]: PullRequest[] }) {
    this.prRequests = prRequests;
    this.prsClosedByUser = prsClosedByUser;
  }

  private scorePr(pr: PullRequest) {
    const votes = pr.votes;
    const maxVotes = Math.max(...this.prRequests.map(p => p.votes));
    const closedByAuthor = this.prsClosedByUser[pr.author]?.length ?? 0;
    return votes + (closedByAuthor * maxVotes * 0.6);
  }

  public rerankPRs() {
    const prsWithScore: [PullRequest, number][] = this.prRequests.map(pr => [pr, this.scorePr(pr)]);
    prsWithScore.sort(([_a, aScore], [_b, bScore]) => bScore - aScore);
    return prsWithScore.map(([pr, _score]) => pr);
  }
}