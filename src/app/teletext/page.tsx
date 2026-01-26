import { Suspense } from "react";
import { PRList } from "@/components/PRList";
import { getRandomFeatureFlags } from "@/lib/chaos-router";

export default function TeletextHome() {
  const flags = getRandomFeatureFlags();

  return (
    <div className="teletext-page">
      {/* Main content area */}
      <div className="teletext-section">
        <div className="teletext-section-header">
          &gt; OPEN PRS - VOTE TO MERGE
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <PRList />
        </Suspense>
      </div>

      {/* Feature flags demo */}
      {flags.guestbook && <div>[GUESTBOOK ENABLED]</div>}
      {flags.treeGame && <div>[TREE GAME ENABLED]</div>}
      {flags.clippy && <div>[CLIPPY ENABLED]</div>}
    </div>
  );
}
