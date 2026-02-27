"use client";

import { useAchievements } from "@/hooks/useAchievements";

export function AwardBoard() {
  const { achievements, unlockedCount, totalCount } = useAchievements();

  return (
    <div>
      <br />
      {`╔════════════════════════════════════════════╗`}
      <br />
      {`║ 🏆 AWARD BOARD (${unlockedCount}/${totalCount})${" ".repeat(Math.max(0, 24 - unlockedCount.toString().length - totalCount.toString().length))}║`}
      <br />
      {`╚════════════════════════════════════════════╝`}
      <br />
      <br />
      {achievements.map((achievement) => {
        const status = achievement.unlocked ? "[✓]" : "[ ]";
        const icon = achievement.unlocked ? achievement.icon : "🔒";
        return (
          <div key={achievement.id} style={{ opacity: achievement.unlocked ? 1 : 0.5 }}>
            {`${status} ${icon} ${achievement.title}`}
            <br />
            {`    ${achievement.description}`}
            <br />
            <br />
          </div>
        );
      })}
      <div style={{ border: "1px solid #666", padding: "8px", marginTop: "8px" }}>
        💡 Tip: Vote on PRs, explore themes, and visit the
        <br />
        museum to unlock more achievements!
      </div>
    </div>
  );
}
