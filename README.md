# OpenChaos.dev

**[openchaos.dev](https://openchaos.dev)**

A self-evolving open source project. Every week, the community votes on PRs, and the winner gets merged.

**The website IS the repo. The repo IS the website.**

## How It Works

1. Anyone submits a PR
2. Community votes via reactions on the PR:
  - 👍 (Thumbs Up) counts as +1
  - 👎 (Thumbs Down) counts as -1
3. Every **Sunday at 09:00 UTC**, the most-voted PR gets merged
4. Vercel auto-deploys
5. Repeat forever

## Rules

- **Vote**: Add a 👍 reaction to support a change, or a 👎 reaction to oppose it
- **Highest Score Wins**: The winner is determined by (Total 👍) - (Total 👎)
- **Ties favor the New**: If scores are equal, the **newest PR** (created most recently) wins
- **CI must pass**: If the build fails, the PR is not eligible
- **No merge conflicts**: PRs with conflicts at merge time are skipped; the next highest PR wins
- **No malware**: Maintainer can reject obviously malicious content

## Instant Override Rule ⚡

If any PR reaches a **higher net score** than the most recently merged PR,
it gets merged immediately—no waiting for Sunday!

**Requirements:**
- Score > Last merged PR's score
- Score ≥ 5 (minimum threshold)
- CI must pass
- No merge conflicts

**Example:**
- Last merged: PR #51 with +12 votes
- New PR reaches +13 votes → **Instant merge!** 🚀

## Maintenance PRs 🔧

Infrastructure fixes and maintenance PRs can be merged immediately by maintainers without going through the voting process.

**How it works:**
- PRs with the `maintenance` label are excluded from override calculations
- These PRs don't count as "last merged" for the Instant Override Rule
- This ensures infrastructure fixes don't disrupt the community voting dynamics

**When to use:**
- Critical bug fixes
- Infrastructure improvements
- CI/CD updates
- Security patches

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
