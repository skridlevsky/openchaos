import { Suspense } from "react";
import { DoomsdaySection } from "@/components/DoomsdaySection";
import { PRList } from "@/components/PRList";
import { getOpenPRs } from "@/lib/github";

export default async function Home() {
  // Fetch PRs server-side to get the winning PR
  let winningPR = null;
  try {
    const prs = await getOpenPRs();
    winningPR = prs.length > 0 ? prs[0] : null;
  } catch {
    // Silently fail, winningPR stays null
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
        OPENCHAOS.DEV
      </h1>

      <DoomsdaySection winningPR={winningPR} />

      <section className="mt-16 w-full flex flex-col items-center">
        <h2 className="text-xl font-medium text-zinc-600 mb-6">
          Open PRs — Vote to merge
        </h2>
        <Suspense
          fallback={
            <div className="w-full max-w-xl text-center py-8">
              <p className="text-zinc-500">Loading PRs...</p>
            </div>
          }
        >
          <PRList />
        </Suspense>
      </section>

      <footer className="mt-16 flex flex-col items-center gap-4 text-sm text-zinc-500">
        <p>
          <a
            href="https://github.com/skridlevsky/openchaos"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 transition-colors"
          >
            View on GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}
