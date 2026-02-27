"use client";

import { useAchievements } from "@/hooks/useAchievements";

export function AwardBoard() {
  const { achievements, unlockedCount, totalCount } = useAchievements();

  return (
    <div className="web2-widget">
      <div className="web2-widget-header">
        🏆 Award Board ({unlockedCount}/{totalCount})
      </div>
      <div className="web2-widget-body">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {achievements.map((achievement: any) => (
            <div
              key={achievement.id}
              className={`achievement-badge ${achievement.unlocked ? "unlocked" : "locked"}`}
              title={achievement.description}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 8px",
                background: achievement.unlocked
                  ? "linear-gradient(180deg, #fff 0%, #e8f4ff 100%)"
                  : "linear-gradient(180deg, #f5f5f5 0%, #d0d0d0 100%)",
                border: achievement.unlocked
                  ? "2px solid #0066cc"
                  : "2px solid #999",
                borderRadius: "4px",
                fontSize: "11px",
                fontFamily: "Tahoma, Arial, sans-serif",
                boxShadow: achievement.unlocked
                  ? "0 2px 4px rgba(0,102,204,0.3), inset 0 1px 0 rgba(255,255,255,0.8)"
                  : "0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)",
                opacity: achievement.unlocked ? 1 : 0.5,
                transition: "all 0.2s ease",
                cursor: "help",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  filter: achievement.unlocked ? "none" : "grayscale(100%)",
                }}
              >
                {achievement.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: achievement.unlocked ? "bold" : "normal",
                    color: achievement.unlocked ? "#0066cc" : "#666",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {achievement.title}
                </div>
                <div
                  style={{
                    color: "#666",
                    fontSize: "10px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {achievement.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "12px",
            padding: "8px",
            background: "linear-gradient(180deg, #fffbcc 0%, #fff4a3 100%)",
            border: "1px solid #f0c000",
            borderRadius: "4px",
            fontSize: "10px",
            color: "#666",
            textAlign: "center",
          }}
        >
          💡 <strong>Tip:</strong> Vote on PRs, explore themes, and visit the
          museum to unlock more achievements!
        </div>
      </div>
    </div>
  );
}
