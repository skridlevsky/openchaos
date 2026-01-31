# OpenChaos.dev

**[openchaos.dev](https://openchaos.dev)**

A self-evolving open source project. Each day, the community votes on PRs, and the top-voted one is merged.

**The website IS the repo. The repo IS the website.**

## How It Works

1. Anyone submits a PR
2. Community votes via reactions on the PR:
  - 👍 (Thumbs Up) counts as +1
  - 👎 (Thumbs Down) counts as -1
3. Every **day at 09:00 UTC**, the most-voted PR gets merged
4. Vercel auto-deploys
5. Repeat forever

## Rules

- **Vote**: Add a 👍 reaction to support a change, or a 👎 reaction to oppose it
- **Highest Score Wins**: The winner is determined by (Total 👍) - (Total 👎)
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

### Prerequisites

- **Node.js** 20+
- **Rust** (for WASM modules)
  ```bash
  # Install Rust
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

  # Add WASM target
  rustup target add wasm32-unknown-unknown

  # Install wasm-pack
  cargo install wasm-pack
  ```

### Setup

```bash
npm install  # Automatically builds WASM via preinstall
npm run dev
```

**Note:** No GitHub token required! The app works without authentication, but may hit rate limits (60 requests/hour). For development with higher limits, you can optionally add a token to `.env.local`:

```bash
GITHUB_TOKEN=your_token_here  # Optional, not committed
```

### WASM Development

The project uses Rust compiled to WebAssembly for performance-critical operations (GitHub API fetching, vote counting, sorting).

```bash
# Rebuild WASM manually
npm run wasm:build

# Run Rust tests
npm run wasm:test

# Watch mode for Rust changes (requires cargo-watch)
npm run wasm:dev
```

**Rust code location:** `rust/openchaos_wasm/`

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- **Rust/WebAssembly** (GitHub API logic)
- Vercel (auto-deploy)
- GitHub API (PR reactions for voting)
