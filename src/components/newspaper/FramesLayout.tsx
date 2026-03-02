"use client";

import { useMemo } from "react";
import type { PullRequest, MergedPullRequest } from "@/lib/github";
import { FramesLayout as SharedFramesLayout } from "@/components/shared/FramesLayout";
import { ExpandablePRSection } from "@/components/shared/ExpandablePRSection";
import { ExpandableHallSection } from "@/components/shared/ExpandableHallSection";
import { VoteStatusProvider } from "@/contexts/VoteStatusContext";
import { PRCard } from "./PRCard";
import { HallOfChaosCard } from "./HallOfChaosCard";

const NEWSPAPER_TABS = [
  { id: "votes" as const, label: "FRONT PAGE" },
  { id: "rising" as const, label: "BREAKING NEWS" },
  { id: "controversial" as const, label: "LETTERS TO THE EDITOR" },
  { id: "discussed" as const, label: "TOWN HALL" },
  { id: "new" as const, label: "LATE EDITION" },
  { id: "hall" as const, label: "THE ARCHIVES" },
];

function NewspaperExpandable({ prs, allowDistinguish = false, scoreLabel }: { prs: PullRequest[]; allowDistinguish?: boolean; scoreLabel?: string }) {
  return (
    <ExpandablePRSection
      prs={prs}
      PRCardComponent={PRCard}
      allowDistinguish={allowDistinguish}
      scoreLabel={scoreLabel}
      emptyMessage={<div className="np-section-empty">No stories filed in this section.</div>}
      expandLabel={(count) => `Continue Reading (${count} articles)`}
      collapseLabel="Return to Front Page"
      buttonClassName="np-expand-btn"
    />
  );
}

function NewspaperHallSection({ prs }: { prs: MergedPullRequest[] }) {
  return (
    <ExpandableHallSection
      prs={prs}
      CardComponent={HallOfChaosCard}
      emptyMessage={<div className="np-empty">No stories have gone to press yet. The first edition awaits!</div>}
      expandLabel={(count) => `Continue Reading (${count} articles)`}
      collapseLabel="Return to Front Page"
      buttonClassName="np-expand-btn"
    />
  );
}

interface Props {
  topByVotes: PullRequest[];
  rising: PullRequest[];
  newest: PullRequest[];
  discussed: PullRequest[];
  controversial: PullRequest[];
  merged: MergedPullRequest[];
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
        tabs={NEWSPAPER_TABS}
        ExpandableSection={NewspaperExpandable}
        HallSection={NewspaperHallSection}
        renderBanner={(pr) => <PRCard pr={pr} isBanner />}
        separator={<hr className="np-rule-double" />}
        renderTabs={(tabs, activeSection, setActiveSection) => (
          <nav className="np-section-nav">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`np-section-tab ${activeSection === item.id ? "np-section-tab-active" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      />
    </VoteStatusProvider>
  );
}
