"use client";

import { useState, useEffect } from "react";
import type { PullRequest } from "@/lib/github";
import { ExpandablePRSection } from "./ExpandablePRSection";
import { PRCard } from "./PRCard";

type Section = "votes" | "rising" | "new" | "discussed" | "controversial";

const VALID_SECTIONS: Section[] = ["votes", "rising", "new", "discussed", "controversial"];

const TAB_ITEMS: { id: Section; label: string }[] = [
  { id: "votes", label: "FRONT PAGE" },
  { id: "rising", label: "BREAKING NEWS" },
  { id: "controversial", label: "LETTERS TO THE EDITOR" },
  { id: "discussed", label: "TOWN HALL" },
  { id: "new", label: "LATE EDITION" },
];

interface SectionDataProps {
  topByVotes: PullRequest[];
  rising: PullRequest[];
  newest: PullRequest[];
  discussed: PullRequest[];
  controversial: PullRequest[];
}

type FramesLayoutProps = SectionDataProps;

function SectionContent({ section, topByVotes, rising, newest, discussed, controversial, skipFirst }: SectionDataProps & { section: Section; skipFirst: boolean }) {
  switch (section) {
    case "votes":
      return <ExpandablePRSection prs={skipFirst ? topByVotes.slice(1) : topByVotes} allowDistinguish />;
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

export function FramesLayout({ topByVotes, rising, newest, discussed, controversial }: FramesLayoutProps) {
  const [activeSection, setActiveSection] = useState<Section>("votes");

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

  useEffect(() => {
    window.location.hash = activeSection;
  }, [activeSection]);

  const leadingPR = activeSection === "votes" && topByVotes.length > 0 ? topByVotes[0] : null;

  return (
    <div>
      <nav className="np-section-nav">
        {TAB_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`np-section-tab ${activeSection === item.id ? "np-section-tab-active" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {leadingPR && (
        <PRCard pr={leadingPR} isBanner />
      )}

      <hr className="np-rule-double" />

      <SectionContent
        section={activeSection}
        topByVotes={topByVotes}
        rising={rising}
        newest={newest}
        discussed={discussed}
        controversial={controversial}
        skipFirst={!!leadingPR}
      />
    </div>
  );
}
