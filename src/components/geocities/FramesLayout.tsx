"use client";

import { useMemo } from "react";
import type { PullRequest } from "@/lib/github";
import { FramesLayout as SharedFramesLayout } from "@/components/shared/FramesLayout";
import { ExpandablePRSection } from "@/components/shared/ExpandablePRSection";
import { VoteStatusProvider } from "@/contexts/VoteStatusContext";
import { PRCard } from "./PRCard";

const GEOCITIES_TABS = [
  { id: "votes" as const, label: "TOP VOTES", icon: "\u2B50" },
  { id: "rising" as const, label: "HOT", icon: "\uD83D\uDD25" },
  { id: "controversial" as const, label: "CONTROVERSIAL", icon: "\u26A0\uFE0F" },
  { id: "discussed" as const, label: "DISCUSSED", icon: "\uD83D\uDCAC" },
  { id: "new" as const, label: "NEWEST", icon: "\uD83C\uDD95" },
];

function GeocitiesExpandable({ prs, allowDistinguish = false, sectionLabel, scoreLabel }: { prs: PullRequest[]; allowDistinguish?: boolean; sectionLabel?: string; scoreLabel?: string }) {
  const tab = GEOCITIES_TABS.find((t) => t.label === sectionLabel);
  const sectionTitle = sectionLabel ? `${tab?.icon ?? "\u2B50"} ${sectionLabel}` : "";
  return (
    <div className="pr-list-section">
      {sectionTitle && (
        <table width="100%" border={2} cellPadding={8} cellSpacing={0} className="pr-list-section-header">
          <tbody>
            <tr>
              <td className="pr-list-section-header-cell">
                <span className="page-header-text"><b>{sectionTitle}</b></span>
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
        emptyMessage={
          <table width="90%" border={1} cellPadding={10}>
            <tbody>
              <tr>
                <td style={{ textAlign: 'center', fontFamily: "'Comic Sans MS', cursive" }}>
                  <b>No PRs in this category yet.</b>
                </td>
              </tr>
            </tbody>
          </table>
        }
        expandLabel={(count) => `Show All (${count}) \u00BB`}
        collapseLabel="\u00AB Show Less"
        buttonStyle={{
          background: '#c0c0c0',
          border: '2px solid',
          borderColor: '#ffffff #000000 #000000 #ffffff',
          cursor: 'pointer',
          padding: '4px 12px',
          fontSize: '12px',
          fontFamily: "'Comic Sans MS', cursive",
          fontWeight: 'bold',
          color: '#000080',
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
        tabs={GEOCITIES_TABS}
        ExpandableSection={GeocitiesExpandable}
        renderTabs={(tabs, activeSection, setActiveSection) => (
          <div style={{ marginBottom: '16px' }}>
            <table border={2} cellPadding={4} cellSpacing={0} style={{ backgroundColor: '#000080' }}>
              <tbody>
                <tr>
                  {tabs.map((item) => (
                    <td key={item.id} style={{ padding: '0' }}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        style={{
                          background: activeSection === item.id ? '#ffff00' : '#c0c0c0',
                          border: '2px solid',
                          borderColor: activeSection === item.id
                            ? '#ffff00 #808080 #808080 #ffff00'
                            : '#ffffff #000000 #000000 #ffffff',
                          cursor: 'pointer',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontFamily: "'Comic Sans MS', cursive",
                          fontWeight: 'bold',
                          color: activeSection === item.id ? '#ff0000' : '#000080',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.icon} {item.label}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      />
    </VoteStatusProvider>
  );
}
