#!/usr/bin/env python3
"""
Old Age Workflow Simulator
Matches the algorithm in .github/workflows/old-age.yml exactly.
Outputs death probability analytics and generates visualization curves.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import math
import json
import random
from datetime import datetime

# Constants — must match the workflow
BASE_DEATH_CHANCE = 0.1
UNMERGEABLE_BASE_PENALTY = 5
UNMERGEABLE_MULTIPLIER = 400


def calculate_death_probability(age_days, interactions, is_unmergeable=False):
    """Exact mirror of the workflow's calculateDeathProbability."""
    death_chance = BASE_DEATH_CHANCE

    age_penalty = (age_days ** 1.6) * 0.06
    death_chance += age_penalty

    log_fitness = math.log(interactions + 1) * 3.0
    age_scale = 0.5 + (age_days / 90)
    death_chance -= log_fitness * age_scale

    if is_unmergeable:
        death_chance += UNMERGEABLE_BASE_PENALTY
        death_chance = death_chance * (1 + UNMERGEABLE_MULTIPLIER / 100)

    return max(0, min(100, death_chance))


def load_prs():
    """Load PR data from pr-data.json."""
    with open('pr-data.json', 'r') as f:
        prs = json.load(f)

    result = []
    for pr in prs:
        created_at = datetime.fromisoformat(pr['createdAt'].replace('Z', '+00:00'))
        age_days = (datetime.now(created_at.tzinfo) - created_at).days

        num_comments = len(pr.get('comments', []))
        num_reactions = sum(
            g.get('users', {}).get('totalCount', 0)
            for g in pr.get('reactionGroups', [])
        )
        num_reviews = len(pr.get('reviews', []))
        interactions = num_comments + num_reactions + num_reviews

        is_unmergeable = pr.get('mergeable') == 'CONFLICTING'

        result.append({
            'number': pr['number'],
            'title': pr['title'],
            'age_days': age_days,
            'interactions': interactions,
            'is_unmergeable': is_unmergeable,
        })

    return result


def simulate_day(prs, num_simulations=10000):
    """
    Monte Carlo simulation of one day with death cap applied.
    Returns per-PR death frequency across simulations.
    """
    death_cap = max(1, len(prs) // 100)
    death_counts = {pr['number']: 0 for pr in prs}

    for _ in range(num_simulations):
        candidates = []
        for pr in prs:
            prob = calculate_death_probability(
                pr['age_days'], pr['interactions'], pr['is_unmergeable']
            )
            if random.random() * 100 < prob:
                candidates.append(pr)

        if len(candidates) > death_cap:
            random.shuffle(candidates)
            candidates = candidates[:death_cap]

        for pr in candidates:
            death_counts[pr['number']] += 1

    return {num: count / num_simulations * 100 for num, count in death_counts.items()}


def print_analytics(prs, simulated_probs):
    """Print text-based analytics table sorted by risk."""
    death_cap = max(1, len(prs) // 100)

    rows = []
    for pr in prs:
        raw_prob = calculate_death_probability(
            pr['age_days'], pr['interactions'], pr['is_unmergeable']
        )
        effective_prob = simulated_probs.get(pr['number'], 0)
        rows.append((pr, raw_prob, effective_prob))

    rows.sort(key=lambda r: r[2], reverse=True)

    lines = []
    lines.append(f"OLD AGE ANALYTICS — {len(prs)} open PRs, death cap = {death_cap}/day")
    lines.append(f"(effective probability from {10000:,} Monte Carlo simulations)")
    lines.append("")
    lines.append(f"{'PR':>6}  {'Age':>4}  {'Int':>4}  {'Raw%':>6}  {'Eff%':>6}  {'Risk':>10}  {'Title'}")
    lines.append(f"{'—'*6}  {'—'*4}  {'—'*4}  {'—'*6}  {'—'*6}  {'—'*10}  {'—'*40}")

    for pr, raw_prob, eff_prob in rows:
        if eff_prob > 2:
            risk = "DANGER"
        elif eff_prob > 0.5:
            risk = "AT RISK"
        elif raw_prob > 0:
            risk = "LOW"
        else:
            risk = "SAFE"

        flag = " [!]" if pr['is_unmergeable'] else ""
        title = pr['title'][:48]
        lines.append(
            f"#{pr['number']:>4}  {pr['age_days']:>4}d  {pr['interactions']:>4}  "
            f"{raw_prob:>5.1f}%  {eff_prob:>5.2f}%  {risk:>10}  {title}{flag}"
        )

    text = "\n".join(lines)
    print(text)
    return text


def generate_plots(prs):
    """Generate death probability curves with real PR overlays."""
    ages = np.arange(0, 365, 1)
    ages_zoomed = np.arange(0, 60, 1)
    fitness_levels = [0, 10, 50, 100, 200]

    fig = plt.figure(figsize=(20, 12))
    gs = fig.add_gridspec(2, 2, hspace=0.3, wspace=0.3)
    ax1 = fig.add_subplot(gs[0, 0])
    ax2 = fig.add_subplot(gs[0, 1])
    ax3 = fig.add_subplot(gs[1, 0])
    ax4 = fig.add_subplot(gs[1, 1])

    mergeable = [pr for pr in prs if not pr['is_unmergeable']]
    unmergeable = [pr for pr in prs if pr['is_unmergeable']]

    def plot_curves(ax, ages_range, is_unmergeable, linestyle='-'):
        for fitness in fitness_levels:
            probs = [calculate_death_probability(a, fitness, is_unmergeable) for a in ages_range]
            ax.plot(ages_range, probs, label=f'{fitness} int', linewidth=2, linestyle=linestyle)
        ax.legend()
        ax.grid(True, alpha=0.3)

    def overlay_prs(ax, pr_list, is_unmergeable, max_y=None):
        if not pr_list:
            return
        pr_ages = [p['age_days'] for p in pr_list]
        pr_probs = [calculate_death_probability(p['age_days'], p['interactions'], is_unmergeable) for p in pr_list]
        color = 'darkred' if is_unmergeable else 'red'
        marker = 'X' if is_unmergeable else 'o'
        ax.scatter(pr_ages, pr_probs, color=color, s=100, alpha=0.7, marker=marker,
                   edgecolors='black', linewidths=2, zorder=10)
        for p in pr_list:
            prob = calculate_death_probability(p['age_days'], p['interactions'], is_unmergeable)
            if max_y is None or prob < max_y:
                ax.annotate(f"#{p['number']}", (p['age_days'], prob),
                            xytext=(5, 5), textcoords='offset points', fontsize=7, alpha=0.7)

    # Plot 1: Full view, mergeable
    ax1.set_title('Death Probability: Mergeable PRs', fontsize=14, fontweight='bold')
    ax1.set_xlabel('Age (days)')
    ax1.set_ylabel('Death Probability (%)')
    ax1.set_ylim(0, 100)
    plot_curves(ax1, ages, False)
    overlay_prs(ax1, mergeable, False)

    # Plot 2: Full view, unmergeable
    ax2.set_title('Death Probability: UNMERGEABLE PRs', fontsize=14, fontweight='bold', color='red')
    ax2.set_xlabel('Age (days)')
    ax2.set_ylabel('Death Probability (%)')
    ax2.set_ylim(0, 100)
    plot_curves(ax2, ages, True, linestyle='--')
    overlay_prs(ax2, unmergeable, True)

    # Plot 3: Zoomed, mergeable
    ax3.set_title('Mergeable PRs (ZOOMED: 0-60 days)', fontsize=14, fontweight='bold')
    ax3.set_xlabel('Age (days)')
    ax3.set_ylabel('Death Probability (%)')
    ax3.set_xlim(0, 60)
    ax3.set_ylim(0, 30)
    plot_curves(ax3, ages_zoomed, False)
    overlay_prs(ax3, mergeable, False, max_y=30)

    # Plot 4: Zoomed, unmergeable
    ax4.set_title('UNMERGEABLE PRs (ZOOMED: 0-60 days)', fontsize=14, fontweight='bold', color='red')
    ax4.set_xlabel('Age (days)')
    ax4.set_ylabel('Death Probability (%)')
    ax4.set_xlim(0, 60)
    ax4.set_ylim(0, 30)
    plot_curves(ax4, ages_zoomed, True, linestyle='--')
    overlay_prs(ax4, unmergeable, True, max_y=30)

    plt.savefig('old-age-curves.png', dpi=150, bbox_inches='tight')
    print("Graph saved to old-age-curves.png")


if __name__ == '__main__':
    print("Loading PRs from pr-data.json...")
    prs = load_prs()
    print(f"Found {len(prs)} open PRs")

    death_cap = max(1, len(prs) // 100)
    print(f"Death cap: {death_cap} (formula: max(1, floor({len(prs)}/100)))")

    print("\nRunning Monte Carlo simulation (10,000 iterations)...")
    simulated = simulate_day(prs)

    print()
    analytics_text = print_analytics(prs, simulated)

    print()
    generate_plots(prs)

    # Save analytics text for PR comment use
    with open('old-age-analytics.txt', 'w') as f:
        f.write(analytics_text)
    print("Analytics saved to old-age-analytics.txt")
