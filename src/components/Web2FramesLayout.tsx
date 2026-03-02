"use client";

import { useMemo } from "react";
import type { PullRequest, MergedPullRequest } from "@/lib/github";
import { FramesLayout as SharedFramesLayout } from "@/components/shared/FramesLayout";
import { ExpandablePRSection } from "@/components/shared/ExpandablePRSection";
import { ExpandableHallSection } from "@/components/shared/ExpandableHallSection";
import { VoteStatusProvider } from "@/contexts/VoteStatusContext";
import { PRCard } from "./PRCard";
import { HallOfChaosCard } from "./HallOfChaosCard";
import { ChaosPointCounter } from "./ChaosPointCounter";

const WEB2_TABS = [
  { id: "votes" as const, label: "Top Votes" },
  { id: "rising" as const, label: "Hot" },
  { id: "controversial" as const, label: "Controversial" },
  { id: "discussed" as const, label: "Discussed" },
  { id: "new" as const, label: "Newest" },
  { id: "hall" as const, label: "Hall of Chaos" },
];

function Web2Expandable({ prs, allowDistinguish = false, scoreLabel }: { prs: PullRequest[]; allowDistinguish?: boolean; scoreLabel?: string }) {
  return (
    <div className="web2-section-body">
      <ExpandablePRSection
        prs={prs}
        PRCardComponent={PRCard}
        allowDistinguish={allowDistinguish}
        scoreLabel={scoreLabel}
        className="pr-list-section"
        buttonClassName="pr-list-expand-button"
      />
    </div>
  );
}

function Web2HallSection({ prs }: { prs: MergedPullRequest[] }) {
  return (
    <div className="web2-section-body">
      <ExpandableHallSection
        prs={prs}
        CardComponent={HallOfChaosCard}
        className="pr-list-section"
        buttonClassName="pr-list-expand-button"
        emptyMessage={<div style={{ textAlign: "center", padding: "24px" }}><strong>No merged PRs yet.</strong><br /><span>The first winner will be immortalized here!</span></div>}
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
  merged: MergedPullRequest[];
}

export function Web2FramesLayout(props: Props & { chaosPts?: number }) {
  const prNumbers = useMemo(
    () => [...new Set([...props.topByVotes, ...props.rising, ...props.newest, ...props.discussed, ...props.controversial].map(pr => pr.number))],
    [props.topByVotes, props.rising, props.newest, props.discussed, props.controversial],
  );

  return (
    <VoteStatusProvider prNumbers={prNumbers}>
      <SharedFramesLayout
        {...props}
        tabs={WEB2_TABS}
        ExpandableSection={Web2Expandable}
        HallSection={Web2HallSection}
        className="web2-section"
        renderTabs={(tabs, activeSection, setActiveSection) => (
          <div className="web2-pr-tabs">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`web2-pr-tab ${activeSection === item.id ? "web2-pr-tab-active" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      />
      {props.chaosPts != null && <ChaosPointCounter pts={props.chaosPts} />}
    </VoteStatusProvider>
  );
}
