# OpenChaos.dev

**[openchaos.dev](https://openchaos.dev)**

A self-evolving open source project. Every week, the community votes on PRs, and the winner gets merged.

**The website IS the repo. The repo IS the website.**

## How It Works

1. Anyone submits a PR
2. Community votes via reactions on the PR:
  - 👍 (Thumbs Up) counts as +1
  - 👎 (Thumbs Down) counts as -1
3. Every **Sunday at 09:00 UTC**, the most-voted big PR and the most-voted small PR get merged
4. Vercel auto-deploys
5. Repeat forever

## Rules

- **Vote**: Add a 👍 reaction to support a change, or a 👎 reaction to oppose it
- **Highest Score Wins**: The winner is determined by (Total 👍) - (Total 👎)
- **Ties favor the New**: If scores are equal, the **newest PR** (created most recently) wins
- **CI must pass**: If the build fails, the PR is not eligible
- **No merge conflicts**: PRs with conflicts at merge time are skipped; the next highest PR wins. Big PR takes precedence over small one in the case of merge conflicts between the two.
- **No malware**: Maintainer can reject obviously malicious content
- **Must label PRs**: PRs must be labeled as "Big" or "Small." Big changes include large, impactful changes like overhauls, while small changes include minor changes, like adding a small feature or a bugfix.
- **Weekly merge schedule**: Each week, one Big-labeled PR and one Small-labeled PR will be merged
- **Correct labeling**: PRs must be labeled correctly, 👎 a PR if it is incorrectly labeled. Recommended way to label is adding `[BIG]` or `[SMALL]` to the PR title

## What Can Be Changed

Everything. Including these rules.

Someone could submit a PR that:
- Changes the UI completely
- Adds a whole new feature
- Removes something
- Adds a backend/database
- Turns it into a game

If it passes CI and gets votes, it can win.

## Development

```bash
npm install
npm run dev
```

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- Vercel (auto-deploy)
- GitHub API (PR reactions for voting)
