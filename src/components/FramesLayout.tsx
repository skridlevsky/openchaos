"use client";

import { useState, useEffect } from "react";
import type { PullRequest } from "@/lib/github";
import { ExpandablePRSection } from "./ExpandablePRSection";

type Section = "top" | "rising" | "new" | "discussed" | "controversial";

interface FramesLayoutProps {
  topByVotes: PullRequest[];
  rising: PullRequest[];
  newest: PullRequest[];
  discussed: PullRequest[];
  controversial: PullRequest[];
}

export function FramesLayout({ topByVotes, rising, newest, discussed, controversial }: FramesLayoutProps) {
  const [activeSection, setActiveSection] = useState<Section>("top");

  const validSections: Section[] = ["top", "rising", "new", "discussed", "controversial"];

  // Sync with URL hash on mount and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Section;
      if (validSections.includes(hash)) {
        setActiveSection(hash);
      }
    };

    handleHashChange(); // Initial check
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavClick = (section: Section) => {
    setActiveSection(section);
    window.location.hash = section;
  };

  const navItems = [
    { id: "top" as Section, label: "TOP BY VOTES", icon: "*" },
    { id: "rising" as Section, label: "HOT THIS WEEK", icon: "^" },
    { id: "controversial" as Section, label: "CONTROVERSIAL", icon: "!" },
    { id: "discussed" as Section, label: "DISCUSSED", icon: "#" },
    { id: "new" as Section, label: "NEWEST", icon: "+" },
  ];

  return (
    <div>
      {/* ASCII Navigation Bar */}
      <div style={{ marginBottom: "1.5em" }}>
        <div>
          {navItems.map((item, i) => (
            <span key={item.id}>
              {i > 0 && " | "}
              <button
                onClick={() => handleNavClick(item.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0",
                  fontSize: "inherit",
                  fontFamily: "inherit",
                  color: "inherit",
                  fontWeight: activeSection === item.id ? "bold" : "normal",
                  textDecoration: activeSection === item.id ? "none" : "underline",
                }}
              >
                [{item.icon}] {item.label}
              </button>
            </span>
          ))}
        </div>
        <div>{"-".repeat(72)}</div>
      </div>

      {/* Active Section Content */}
      {activeSection === "top" && (
        <ExpandablePRSection
          title="[*] TOP BY VOTES"
          prs={topByVotes}
          showRank
        />
      )}
      {activeSection === "rising" && (
        <ExpandablePRSection
          title="[^] HOT THIS WEEK"
          prs={rising.map((pr) => ({ ...pr, votes: pr.hotScore }))}
        />
      )}
      {activeSection === "new" && (
        <ExpandablePRSection
          title="[+] NEWEST"
          prs={newest}
        />
      )}
      {activeSection === "discussed" && (
        <ExpandablePRSection
          title="[#] DISCUSSED"
          prs={discussed}
        />
      )}
      {activeSection === "controversial" && (
        <ExpandablePRSection
          title="[!] CONTROVERSIAL"
          prs={controversial}
        />
      )}
    </div>
  );
}
