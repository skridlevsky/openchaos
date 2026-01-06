# OpenChaos.dev

**[openchaos.dev](https://openchaos.dev)**

A self-evolving open source project. Every week, the community votes on PRs, and the winner gets merged.

**The website IS the repo. The repo IS the website.**

## How It Works

1. Anyone submits a PR
2. Community votes via 👍 reactions on the PR
3. Every **Sunday at 09:00 UTC**, the most-voted PR gets merged
4. Vercel auto-deploys
5. Repeat forever

## Rules

- **Vote**: Add a 👍 reaction to any open PR
- **Most votes wins**: Ties are decided by the maintainer
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

### Rust/WASM

The generated WASM bundle lives in `src/wasm/pkg`. If you change
`rust/openchaos_wasm`, rebuild with:

```bash
npm run wasm:build
```

Prereqs: `rustup` installed and `rustup target add wasm32-unknown-unknown`.

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- Vercel (auto-deploy)
- GitHub API (PR reactions for voting)
