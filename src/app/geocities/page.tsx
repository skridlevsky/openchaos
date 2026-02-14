import { Suspense } from "react";
import { Countdown } from "@/components/Countdown";
import { PRList } from "@/components/PRList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HallOfChaos } from "@/components/HallOfChaos";
import { getRandomFeatureFlags } from "@/lib/chaos-router";
import { AuthButton } from "@/components/AuthButton";

export default function Home() {
  if (Math.random() <= 0.01337) {
    return null;
  }

  const flags = getRandomFeatureFlags();

  return (
    <>
      <div className="absolute top-8 right-4">
        <ThemeToggle />
      </div>
      <Countdown />

      <div>
        <div>
          <AuthButton /> <a href="doom.html">[Play DOOM]</a>
          <br /><br />
          <pre className="dickbutt">
            8===D (‿|‿)
          </pre>
          <br />
          <Suspense
            fallback={
              <div>
                Loading PRs... Please Wait...
              </div>
            }
          >
            <PRList />
          </Suspense>
        </div>

        <div>
          HALL OF CHAOS - PAST WINNERS
          <br />
          ----------------------------
          <br />
          <Suspense
            fallback={
              <div>
                Loading history... Please Wait...
              </div>
            }
          >
            <HallOfChaos />
          </Suspense>
        </div>
      </div>
    </>
  );
}
