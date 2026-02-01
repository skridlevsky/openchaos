import { Suspense } from "react";
import { Countdown } from "@/components/Countdown";
import { PRList } from "@/components/PRList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HallOfChaos } from "@/components/HallOfChaos";

const title = `
  ___                 ___ _                
 / _ \\ _ __  ___ _ _ / __| |_  __ _ ___ ___
| (_) | '_ \\/ -_) ' \\ (__| ' \\/ _\` / _ (_-<
 \\___/| .__/\\___|_||_\\___|_||_\\__,_\\___/__/
      |_|  
                                      
`;

export default function Home() {
  if (Math.random() <= 0.01337) {
    return null;
  }

  return (
    <>
    <pre >{title}</pre>
      <div className="absolute top-8 right-4">
        <ThemeToggle />
      </div>
      <Countdown />

      <div>
        <div>

          <pre className="dickbutt">
            8===D (‿|‿)
          </pre>
          <br />
          OPEN PRS - VOTE TO MERGE
          <br />
          ------------------------
          <br />
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
