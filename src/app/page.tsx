import { Suspense } from "react";
import { Countdown } from "@/components/Countdown";
import { PRList } from "@/components/PRList";

import { ThemeToggle } from "@/components/ThemeToggle";
import { IE6Layout } from "@/components/IE6Layout";
import { WebCounter } from "@/components/WebCounter";
import { HallOfChaos } from "@/components/HallOfChaos";

export default function Home() {
  if (Math.random() <= 0.01337) {
    return null;
  }

  return (
    <IE6Layout>
      <Countdown />
      <div className="absolute top-8 right-4">
        <ThemeToggle />
      </div>
      <div className="page-container">
        <table width="100%" border={2} cellPadding={15} cellSpacing={0} className="page-main-table">
          <tbody>
            <tr>
              <td className="page-header-cell">
                <span className="page-header-text">
                  <b>
                    <span className="sparkle-pulse">✨</span> <span className="blink-text">OPEN PRS - VOTE TO MERGE</span> <span className="sparkle-pulse sparkle-delay-2">✨</span>
                  </b>
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <img src="/dickbutt.gif" style={{ width: "321px", display: "block", margin: "0 auto" }} />
              </td>
            </tr>
            <tr>
              <td className="page-content-cell">
                <div className="page-content-flex">
                  <Suspense
                    fallback={
                      <table width="90%" border={1} cellPadding={10} className="page-loading-table">
                        <tbody>
                          <tr>
                            <td className="page-loading-cell">
                              <span className="page-loading-text">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='16' cy='16' r='12' fill='%23ffff00' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E" alt="Loading..." className="spin" />
                                <br />
                                <b>Loading PRs... Please Wait...</b>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    }
                  >
                    <div className="page-pr-container">
                      <PRList />
                    </div>
                  </Suspense>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <table width="100%" border={2} cellPadding={15} cellSpacing={0} className="page-main-table" style={{ marginTop: '20px' }}>
          <tbody>
            <tr>
              <td className="page-header-cell">
                <span className="page-header-text">
                  <b>
                    <span className="sparkle-pulse">🏆</span> <span className="blink-text">HALL OF CHAOS - PAST WINNERS</span> <span className="sparkle-pulse sparkle-delay-2">🏆</span>
                  </b>
                </span>
              </td>
            </tr>
            <tr>
              <td className="page-content-cell">
                <div className="page-content-flex">
                  <Suspense
                    fallback={
                      <table width="90%" border={1} cellPadding={10} className="page-loading-table">
                        <tbody>
                          <tr>
                            <td className="page-loading-cell">
                              <span className="page-loading-text">
                                <b>Loading history... Please Wait...</b>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    }
                  >
                    <HallOfChaos />
                  </Suspense>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <WebCounter />
    </IE6Layout>
  );
}
