"use client";

import { useAchievements } from "@/hooks/useAchievements";

export function AwardBoard() {
  const { achievements, unlockedCount, totalCount } = useAchievements();

  return (
    <div className="newspaper-widget" style={{ marginTop: "20px" }}>
      <div className="newspaper-widget-header">
        <span style={{ fontSize: "16px", fontWeight: "bold" }}>
          AWARD BOARD
        </span>
      </div>
      <div className="newspaper-widget-body">
        <p style={{ fontSize: "12px", marginBottom: "12px", fontStyle: "italic" }}>
          {unlockedCount} of {totalCount} achievements unlocked
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              style={{
                padding: "8px",
                border: achievement.unlocked ? "2px solid #000" : "1px solid #999",
                backgroundColor: achievement.unlocked ? "#f9f9f9" : "#e5e5e5",
                opacity: achievement.unlocked ? 1 : 0.6,
                fontFamily: "Georgia, serif",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "24px", filter: achievement.unlocked ? "none" : "grayscale(100%)" }}>
                  {achievement.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", fontSize: "13px" }}>
                    {achievement.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "#555" }}>
                    {achievement.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: "12px",
            padding: "8px",
            border: "1px solid #000",
            backgroundColor: "#fffbcc",
            fontSize: "11px",
            fontStyle: "italic",
          }}
        >
          Tip: Vote on PRs, explore themes, and visit the museum to unlock more achievements!
        </div>
      </div>
    </div>
  );
}
