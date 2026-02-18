import { Suspense } from "react";
import { Countdown } from "@/components/Countdown";
import { ControlledChaos } from "@/components/ControlledChaos";
import { PRList } from "@/components/PRList";

import { Web2Layout } from "@/components/Web2Layout";
import { HallOfChaos } from "@/components/HallOfChaos";
import { Web2LoadingSpinner } from "@/components/Web2LoadingSpinner";

export default function Web2Home() {
  return (
    <Web2Layout>
      <Countdown />
      <ControlledChaos />
      <div className="page-container">
        <Suspense fallback={<Web2LoadingSpinner text="Loading PRs..." />}>
          <PRList />
        </Suspense>

        {/* Hall of Chaos Section */}
        <div className="web2-section">
          <div className="web2-section-header">
            <span className="web2-section-title">Hall of Chaos — Past Winners</span>
          </div>
          <div className="web2-section-body">
            <Suspense fallback={<Web2LoadingSpinner text="Loading history..." />}>
              <HallOfChaos />
            </Suspense>
          </div>
        </div>
      </div>
    </Web2Layout>
  );
}
