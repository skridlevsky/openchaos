import { Suspense } from "react";
import { Countdown } from "@/components/Countdown";
import { PRList } from "@/components/PRList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HallOfChaos } from "@/components/HallOfChaos";
import { AuthButton } from "@/components/AuthButton";
const title = `
  ___                 ___ _                
 / _ \\ _ __  ___ _ _ / __| |_  __ _ ___ ___
| (_) | '_ \\/ -_) ' \\ (__| ' \\/ _\` / _ (_-<
 \\___/| .__/\\___|_||_\\___|_||_\\__,_\\___/__/
      |_|  
                                      
`;

export default function Home() {
  return (
    <>
    <pre >{title}</pre>
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