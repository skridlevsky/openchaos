import { Suspense } from "react";
import { Countdown } from "@/components/Countdown";
import { ControlledChaos } from "@/components/ControlledChaos";
import { PRList } from "@/components/PRList";

import { Web2Layout } from "@/components/Web2Layout";
import { HallOfChaos } from "@/components/HallOfChaos";
import { Web2LoadingSpinner } from "@/components/Web2LoadingSpinner";
import { GuyFieri } from "@/components/GuyFieri";
import { Web2CollapsibleSection } from "@/components/Web2CollapsibleSection";

export default function Web2Home() {
  return (
    <Web2Layout>
      <Countdown />
      <ControlledChaos />
      <GuyFieri />
      <div className="page-container">
        <Suspense fallback={<Web2LoadingSpinner text="Loading PRs..." />}>
          <PRList />
        </Suspense>

        {/* Hall of Chaos Section */}
        <Web2CollapsibleSection title="Hall of Chaos — Past Winners" defaultExpanded={false}>
          <Suspense fallback={<Web2LoadingSpinner text="Loading history..." />}>
            <HallOfChaos />
          </Suspense>
        </Web2CollapsibleSection>
      </div>
    </Web2Layout>
  );
}
