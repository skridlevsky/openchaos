import { Suspense } from "react";
import { Countdown } from "@/components/vaporwave/Countdown";
import { ControlledChaos } from "@/components/ControlledChaos";
import { PRList } from "@/components/vaporwave/PRList";
import { HallOfChaos } from "@/components/vaporwave/HallOfChaos";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";

export default function VaporwaveHome() {
  return (
    <>
      <div className="vw-topbar">
        <AuthButton />
        <ThemeToggle />
      </div>

      <div className="vw-title" data-text="OpenChaos">OpenChaos</div>
      <div className="vw-subtitle">community-driven evolution</div>

      <Countdown />
      <ControlledChaos />

      <Suspense
        fallback={
          <div className="vw-message-box">Loading PRs...</div>
        }
      >
        <PRList />
      </Suspense>

      <div className="vw-hall-section">
        <div className="vw-section-header">Hall of Chaos &mdash; Past Winners</div>
        <Suspense
          fallback={
            <div className="vw-message-box">Loading history...</div>
          }
        >
          <HallOfChaos />
        </Suspense>
      </div>
    </>
  );
}
