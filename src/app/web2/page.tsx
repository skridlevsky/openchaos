import { Suspense } from "react";
import { Countdown } from "@/components/Countdown";
import { ControlledChaos } from "@/components/ControlledChaos";
import { PRList } from "@/components/PRList";

import { Web2Layout } from "@/components/Web2Layout";

import { Web2LoadingSpinner } from "@/components/Web2LoadingSpinner";
import { GuyFieri } from "@/components/GuyFieri";

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
      </div>
    </Web2Layout>
  );
}
