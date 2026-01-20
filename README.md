# OpenChaos.dev

**[openchaos.dev](https://openchaos.dev)**

A self-evolving open source project. Each day, the community votes on PRs, and the top-voted one is merged.

**The website IS the repo. The repo IS the website.**

## How It Works

1. Anyone submits a PR
2. Community votes via reactions on the PR
3. The upvote/downvote emojis shuffle every day (using GitHub's reaction set: 👍 👎 😄 😕 ❤️ 🎉 🚀 👀)
4. Every **day at 09:00 UTC**, the most-voted PR gets merged
5. Vercel auto-deploys
6. Repeat forever

## Rules

- **Vote**: Add reactions to PRs on GitHub. Check [openchaos.dev](https://openchaos.dev) to see today's upvote/downvote emojis
- **Highest Score Wins**: The winner is determined by (Total Upvotes) - (Total Downvotes)
- **Ties favor the New**: If scores are equal, the **newest PR** (created most recently) wins
- **CI must pass**: If the build fails, the PR is not eligible
- **No merge conflicts**: PRs with conflicts at merge time are skipped; the next highest PR wins
- **No malware**: Maintainer can reject obviously malicious content

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
