"use client";

import { useMemo } from "react";
import type { PullRequest } from "@/lib/github";
import { FramesLayout as SharedFramesLayout } from "@/components/shared/FramesLayout";
import { ExpandablePRSection } from "@/components/shared/ExpandablePRSection";
import { VoteStatusProvider } from "@/contexts/VoteStatusContext";
import { PRCard } from "./PRCard";

const VAPORWAVE_TABS = [
  { id: "votes" as const, label: "Top Votes", icon: "\u2605" },
  { id: "rising" as const, label: "Rising", icon: "\u2191" },
  { id: "controversial" as const, label: "Controversial", icon: "\u26A1" },
  { id: "discussed" as const, label: "Discussed", icon: "\u2709" },
  { id: "new" as const, label: "Newest", icon: "\u2726" },
];

function VaporwaveExpandable({ prs, allowDistinguish = false, sectionLabel, scoreLabel }: { prs: PullRequest[]; allowDistinguish?: boolean; sectionLabel?: string; scoreLabel?: string }) {
  return (
    <div>
      {sectionLabel && <div className="vw-section-header">{sectionLabel}</div>}
      <ExpandablePRSection
        prs={prs}
        PRCardComponent={PRCard}
        allowDistinguish={allowDistinguish}
        scoreLabel={scoreLabel}
        emptyMessage={<div className="vw-message-box">No PRs in this category yet.</div>}
        expandLabel={(count) => `Show All (${count})`}
        collapseLabel="Show Less"
        buttonClassName="vw-expand-btn"
      />
    </div>
  );
}

interface Props {
  topByVotes: PullRequest[];
  rising: PullRequest[];
  newest: PullRequest[];
  discussed: PullRequest[];
  controversial: PullRequest[];
}

export function FramesLayout(props: Props) {
  const prNumbers = useMemo(
    () => [...new Set([...props.topByVotes, ...props.rising, ...props.newest, ...props.discussed, ...props.controversial].map(pr => pr.number))],
    [props.topByVotes, props.rising, props.newest, props.discussed, props.controversial],
  );

  return (
    <VoteStatusProvider prNumbers={prNumbers}>
      <SharedFramesLayout
        {...props}
        tabs={VAPORWAVE_TABS}
        ExpandableSection={VaporwaveExpandable}
        renderTabs={(tabs, activeSection, setActiveSection) => (
          <div className="vw-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`vw-tab ${activeSection === tab.id ? "vw-tab-active" : ""}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        )}
      />
    </VoteStatusProvider>
  );
}
