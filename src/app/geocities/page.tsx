import { Suspense } from "react";
import { Countdown } from "@/components/geocities/Countdown";
import { PRList } from "@/components/geocities/PRList";
import { IE6Layout } from "@/components/geocities/IE6Layout";
import { WebCounter } from "@/components/geocities/WebCounter";
import { HallOfChaos } from "@/components/geocities/HallOfChaos";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";

export default function GeocitiesHome() {
  return (
    <IE6Layout>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
          <ThemeToggle />
        </div>
      </div>
      <Countdown />
      <div className="page-container">
        <table width="100%" border={2} cellPadding={15} cellSpacing={0} className="page-main-table">
          <tbody>
            <tr>
              <td className="page-header-cell">
                <span className="page-header-text">
                  <b>
                    <span className="sparkle-pulse">&#10024;</span> <span className="blink-text">OPEN PRS - VOTE TO MERGE</span> <span className="sparkle-pulse sparkle-delay-2">&#10024;</span>
                  </b>
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <AuthButton /> <a href="/museum">[OpenChaos Museum]</a>
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
                    <span className="sparkle-pulse">&#127942;</span> <span className="blink-text">HALL OF CHAOS - PAST WINNERS</span> <span className="sparkle-pulse sparkle-delay-2">&#127942;</span>
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
