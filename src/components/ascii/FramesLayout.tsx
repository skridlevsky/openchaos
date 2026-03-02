"use client";

import { useMemo } from "react";
import type { PullRequest } from "@/lib/github";
import { FramesLayout as SharedFramesLayout } from "@/components/shared/FramesLayout";
import { ExpandablePRSection } from "@/components/shared/ExpandablePRSection";
import { VoteStatusProvider } from "@/contexts/VoteStatusContext";
import { PRCard } from "./PRCard";

const ASCII_TABS = [
  { id: "votes" as const, label: "TOP VOTES", icon: "*" },
  { id: "rising" as const, label: "HOT", icon: "^" },
  { id: "controversial" as const, label: "CONTROVERSIAL", icon: "!" },
  { id: "discussed" as const, label: "DISCUSSED", icon: "#" },
  { id: "new" as const, label: "NEWEST", icon: "+" },
];

function AsciiExpandable({ prs, allowDistinguish = false, sectionLabel, scoreLabel }: { prs: PullRequest[]; allowDistinguish?: boolean; sectionLabel?: string; scoreLabel?: string }) {
  const icon = ASCII_TABS.find((t) => t.label === sectionLabel)?.icon ?? "*";
  const sectionTitle = sectionLabel ? `[${icon}] ${sectionLabel}` : "";
  return (
    <div className="pr-list-section">
      {sectionTitle && (
        <table width="100%" border={2} cellPadding={8} cellSpacing={0} className="pr-list-section-header">
          <tbody>
            <tr>
              <td className="pr-list-section-header-cell">
                {sectionTitle}<br />{"-".repeat(sectionTitle.length)}<br />
              </td>
            </tr>
          </tbody>
        </table>
      )}
      <ExpandablePRSection
        prs={prs}
        PRCardComponent={PRCard}
        allowDistinguish={allowDistinguish}
        scoreLabel={scoreLabel}
        emptyMessage={<div>No PRs in this category yet.</div>}
        expandLabel={(count) => `Show All (${count}) >`}
        collapseLabel="Show Less"
        className="pr-list-container"
        buttonStyle={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0",
          fontSize: "inherit",
          fontFamily: "inherit",
          color: "inherit",
          textDecoration: "underline",
        }}
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
        tabs={ASCII_TABS}
        ExpandableSection={AsciiExpandable}
        renderTabs={(tabs, activeSection, setActiveSection) => (
          <div className="mb-6">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {tabs.map((item) => (
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
        )}
      />
    </VoteStatusProvider>
  );
}
