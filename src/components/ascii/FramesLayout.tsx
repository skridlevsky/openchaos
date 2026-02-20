"use client";

import { useState, useEffect } from "react";
import type { PullRequest } from "@/lib/github";
import { ExpandablePRSection } from "./ExpandablePRSection";

type Section = "votes" | "rising" | "new" | "discussed" | "controversial";

const VALID_SECTIONS: Section[] = ["votes", "rising", "new", "discussed", "controversial"];

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "votes", label: "TOP VOTES", icon: "*" },
  { id: "rising", label: "HOT", icon: "^" },
  { id: "controversial", label: "CONTROVERSIAL", icon: "!" },
  { id: "discussed", label: "DISCUSSED", icon: "#" },
  { id: "new", label: "NEWEST", icon: "+" },
];

interface SectionDataProps {
  topByVotes: PullRequest[];
  rising: PullRequest[];
  newest: PullRequest[];
  discussed: PullRequest[];
  controversial: PullRequest[];
}

type FramesLayoutProps = SectionDataProps;

function SectionContent({ section, topByVotes, rising, newest, discussed, controversial }: SectionDataProps & { section: Section }) {
  switch (section) {
    case "votes":
      return <ExpandablePRSection title="[*] TOP VOTES" prs={topByVotes} allowDistinguish />;
    case "rising":
      return <ExpandablePRSection title="[^] HOT" prs={rising.map((pr) => ({ ...pr, votes: pr.hotScore }))} />;
    case "new":
      return <ExpandablePRSection title="[+] NEWEST" prs={newest} />;
    case "discussed":
      return <ExpandablePRSection title="[#] DISCUSSED" prs={discussed} />;
    case "controversial":
      return <ExpandablePRSection title="[!] CONTROVERSIAL" prs={controversial} />;
  }
}

export function FramesLayout({ topByVotes, rising, newest, discussed, controversial }: FramesLayoutProps) {
  const [activeSection, setActiveSection] = useState<Section>("votes");

  // Sync with URL hash on mount and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Section;
      if (VALID_SECTIONS.includes(hash)) {
        setActiveSection(hash);
      }
    };

    handleHashChange(); // Initial check
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Sync hash to active section
  useEffect(() => {
    window.location.hash = activeSection;
  }, [activeSection]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`bg-transparent border-none cursor-pointer p-0 text-inherit whitespace-nowrap ${
                activeSection === item.id ? "font-bold no-underline" : "font-normal underline"
              }`}
              style={{ fontSize: "inherit", fontFamily: "inherit" }}
            >
              [{item.icon}] {item.label}
            </button>
          ))}
        </div>
        <div>{"-".repeat(72)}</div>
      </div>

      <SectionContent
        section={activeSection}
        topByVotes={topByVotes}
        rising={rising}
        newest={newest}
        discussed={discussed}
        controversial={controversial}
      />
    </div>
  );
}
