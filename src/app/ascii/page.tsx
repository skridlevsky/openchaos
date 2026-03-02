import { Suspense } from "react";
import { Countdown } from "@/components/ascii/Countdown";
import { ControlledChaos } from "@/components/ControlledChaos";
import { PRList } from "@/components/ascii/PRList";
import { ThemeToggle } from "@/components/ThemeToggle";

import { AuthButton } from "@/components/AuthButton";
import { GuyFieri } from "@/components/GuyFieri";

const title = `
  ___                 ___ _
 / _ \\ _ __  ___ _ _ / __| |_  __ _ ___ ___
| (_) | '_ \\/ -_) ' \\ (__| ' \\/ _\` / _ (_-<
 \\___/| .__/\\___|_||_\\___|_||_\\__,_\\___/__/
      |_|

`;

export default function AsciiHome() {
  return (
    <>
    <pre >{title}</pre>
      <div className="absolute top-8 right-4">
        <ThemeToggle />
      </div>
      <Countdown />
      <ControlledChaos />
      <GuyFieri />
      <div>
        <div>
          <AuthButton /> <a href="/museum">[OpenChaos Museum]</a>
          <br /><br />
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

      </div>
    </>
  );
}
