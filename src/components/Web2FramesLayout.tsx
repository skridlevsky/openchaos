"use client";

import { useState, useEffect } from "react";
import type { PullRequest } from "@/lib/github";
import { ExpandablePRSection } from "./ExpandablePRSection";

type Section = "votes" | "rising" | "new" | "discussed" | "controversial";

const VALID_SECTIONS: Section[] = ["votes", "rising", "new", "discussed", "controversial"];

const TAB_ITEMS: { id: Section; label: string }[] = [
  { id: "votes", label: "Top Votes" },
  { id: "rising", label: "Hot" },
  { id: "controversial", label: "Controversial" },
  { id: "discussed", label: "Discussed" },
  { id: "new", label: "Newest" },
];

interface SectionDataProps {
  topByVotes: PullRequest[];
  rising: PullRequest[];
  newest: PullRequest[];
  discussed: PullRequest[];
  controversial: PullRequest[];
}

type Web2FramesLayoutProps = SectionDataProps;

function SectionContent({ section, topByVotes, rising, newest, discussed, controversial }: SectionDataProps & { section: Section }) {
  switch (section) {
    case "votes":
      return <ExpandablePRSection prs={topByVotes} showRank />;
    case "rising":
      return <ExpandablePRSection prs={rising.map((pr) => ({ ...pr, votes: pr.hotScore }))} />;
    case "new":
      return <ExpandablePRSection prs={newest} />;
    case "discussed":
      return <ExpandablePRSection prs={discussed} />;
    case "controversial":
      return <ExpandablePRSection prs={controversial} />;
  }
}

export function Web2FramesLayout({ topByVotes, rising, newest, discussed, controversial }: Web2FramesLayoutProps) {
  const [activeSection, setActiveSection] = useState<Section>("votes");

  // Sync with URL hash on mount and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Section;
      if (VALID_SECTIONS.includes(hash)) {
        setActiveSection(hash);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Sync hash to active section
  useEffect(() => {
    window.location.hash = activeSection;
  }, [activeSection]);

  return (
    <div className="web2-section">
      <div className="web2-pr-tabs">
        {TAB_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`web2-pr-tab ${activeSection === item.id ? "web2-pr-tab-active" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="web2-section-body">
        <SectionContent
          section={activeSection}
          topByVotes={topByVotes}
          rising={rising}
          newest={newest}
          discussed={discussed}
          controversial={controversial}
        />
      </div>
    </div>
  );
}
