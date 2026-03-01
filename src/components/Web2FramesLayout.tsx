"use client";

import { useMemo } from "react";
import type { PullRequest } from "@/lib/github";
import { FramesLayout as SharedFramesLayout } from "@/components/shared/FramesLayout";
import { ExpandablePRSection } from "@/components/shared/ExpandablePRSection";
import { VoteStatusProvider } from "@/contexts/VoteStatusContext";
import { PRCard } from "./PRCard";
import { ChaosPointCounter } from "./ChaosPointCounter";

const WEB2_TABS = [
  { id: "votes" as const, label: "Top Votes" },
  { id: "rising" as const, label: "Hot" },
  { id: "controversial" as const, label: "Controversial" },
  { id: "discussed" as const, label: "Discussed" },
  { id: "new" as const, label: "Newest" },
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

interface Props {
  topByVotes: PullRequest[];
  rising: PullRequest[];
  newest: PullRequest[];
  discussed: PullRequest[];
  controversial: PullRequest[];
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
