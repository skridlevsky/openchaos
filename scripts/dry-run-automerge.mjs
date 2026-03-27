#!/usr/bin/env node
/**
 * Dry-run of the automerge workflow logic.
 * Evaluates all open PRs exactly like the real workflow, but never merges.
 *
 * Usage:
 *   node scripts/dry-run-automerge.mjs [--repo owner/repo]
 *
 * Requires: `gh` CLI authenticated, Node 20+, npm dependencies installed.
 */

import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const REPO =
  process.argv.includes("--repo") ?
    process.argv[process.argv.indexOf("--repo") + 1] :
    "skridlevsky/openchaos";
const [owner, repo] = REPO.split("/");

const TOKEN = execSync("gh auth token", { encoding: "utf-8" }).trim();

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `token ${TOKEN}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${path}`);
  return res.json();
}

// --- Rhyme checking (mirrors automerge.yml) ---
const localRequire = createRequire(process.cwd() + "/package.json");
const { default: rhymesWith } = await import(localRequire.resolve("rhymes-with"));

function hasRhymingWords(title) {
  const words = title.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      if (words[i] !== words[j] && rhymesWith(words[i], words[j])) return true;
    }
  }
  return false;
}

// --- Fetch & rank PRs ---
let allPRs = [];
let page = 1;
while (true) {
  const prs = await api(`/repos/${owner}/${repo}/pulls?state=open&per_page=100&page=${page}`);
  allPRs = allPRs.concat(prs);
  if (prs.length < 100) break;
  page++;
}

const results = await Promise.allSettled(
  allPRs.map(async (pr) => {
    let allReactions = [];
    let reactPage = 1;
    while (true) {
      const reactions = await api(
        `/repos/${owner}/${repo}/issues/${pr.number}/reactions?per_page=100&page=${reactPage}`
      );
      allReactions = allReactions.concat(reactions);
      if (reactions.length < 100) break;
      reactPage++;
    }
    const thumbsUp = allReactions.filter((r) => r.content === "+1").length;
    const thumbsDown = allReactions.filter((r) => r.content === "-1").length;
    return { number: pr.number, title: pr.title, author: pr.user.login, createdAt: pr.created_at, thumbsUp, thumbsDown, votes: thumbsUp - thumbsDown };
  })
);

const prsWithVotes = [];
for (const [i, result] of results.entries()) {
  if (result.status === "fulfilled") prsWithVotes.push(result.value);
  else console.log(`  WARNING: Failed to fetch reactions for PR #${allPRs[i].number}: ${result.reason.message}`);
}

prsWithVotes.sort(
  (a, b) => b.votes - a.votes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

if (prsWithVotes.length === 0) { console.log("No open PRs found."); process.exit(0); }

console.log("=== PR Rankings ===");
for (const pr of prsWithVotes) {
  console.log(`#${pr.number} — ${pr.votes} net votes — "${pr.title}" by @${pr.author}`);
}
console.log("===================\n");

// --- Evaluate each PR ---
for (let rank = 0; rank < prsWithVotes.length; rank++) {
  const pr = prsWithVotes[rank];
  if (pr.votes <= 0) {
    console.log(`PR #${pr.number} has ${pr.votes} net votes — stopping (no positive-vote PRs remain).`);
    break;
  }

  console.log(`\nEvaluating PR #${pr.number} (${pr.votes} net votes)...`);

  try {
    const detail = await api(`/repos/${owner}/${repo}/pulls/${pr.number}`);

    if (detail.mergeable === null) {
      console.log(`  PR #${pr.number} mergeability unknown — skipping.`);
      continue;
    }
    if (detail.mergeable === false) {
      console.log(`  PR #${pr.number} has merge conflicts — skipping.`);
      continue;
    }

    if (!hasRhymingWords(pr.title)) {
      console.log(`  PR #${pr.number} title doesn't contain rhyming words — skipping.`);
      continue;
    }

    // CI check — this is the logic we're testing
    const statuses = await api(`/repos/${owner}/${repo}/commits/${detail.head.sha}/status`);
    const checkRuns = await api(`/repos/${owner}/${repo}/commits/${detail.head.sha}/check-runs`);

    if (statuses.state === "failure" || statuses.state === "error") {
      console.log(`  PR #${pr.number} has ${statuses.state} commit status — skipping.`);
      continue;
    }
    if (statuses.state === "pending" && statuses.total_count > 0) {
      console.log(`  PR #${pr.number} has ${statuses.total_count} pending commit status(es) — skipping.`);
      continue;
    }

    const incompleteChecks = checkRuns.check_runs.filter((cr) => cr.status !== "completed");
    if (incompleteChecks.length > 0) {
      console.log(`  PR #${pr.number} has ${incompleteChecks.length} check(s) still running — skipping.`);
      continue;
    }

    const failedChecks = checkRuns.check_runs.filter(
      (cr) => cr.conclusion !== "success" && cr.conclusion !== "skipped"
    );
    if (failedChecks.length > 0) {
      console.log(`  PR #${pr.number} has failing CI checks — skipping.`);
      continue;
    }

    // Would merge
    console.log(`\n>>> WOULD MERGE PR #${pr.number} by @${pr.author}: "${pr.title}" (${pr.votes} net votes) <<<`);
    console.log(`    (status API: state=${statuses.state}, total_count=${statuses.total_count})`);
    console.log(`    (check runs: ${checkRuns.check_runs.map((cr) => `${cr.name}=${cr.conclusion}`).join(", ")})`);
    process.exit(0);
  } catch (err) {
    console.log(`  ERROR: Failed to evaluate PR #${pr.number}: ${err.message}. Trying next PR.`);
    continue;
  }
}

console.log("\nNo mergeable PR with positive votes found.");
