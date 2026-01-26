import { Suspense } from "react";
import { PRList } from "@/components/PRList";
import { HallOfChaos } from "@/components/HallOfChaos";
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

      {/* Hall of Chaos */}
      <div className="teletext-section">
        <div className="teletext-section-header">
          &gt; HALL OF CHAOS - PAST WINNERS
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <HallOfChaos />
        </Suspense>
      </div>

      {/* Feature flags demo */}
      {flags.guestbook && <div>[GUESTBOOK ENABLED]</div>}
      {flags.treeGame && <div>[TREE GAME ENABLED]</div>}
      {flags.clippy && <div>[CLIPPY ENABLED]</div>}
    </div>
  );
}
