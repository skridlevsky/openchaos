import { Suspense } from "react";
import { Countdown } from "@/components/Countdown";
import { PRList } from "@/components/PRList";
import { AsteroidsGame } from "@/components/AsteroidsGame";
import { getActivePhysics } from "@/lib/github";

export default async function Home() {
  const physics = await getActivePhysics();

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
        OPENCHAOS.DEV
      </h1>

      <div className="mt-12">
        <Countdown />
      </div>

      <section className="mt-12 w-full flex flex-col items-center">
        <h2 className="text-lg font-medium text-zinc-600 mb-4">
          Community-Controlled Asteroids
        </h2>
        <AsteroidsGame physics={physics} />
        <p className="mt-4 text-sm text-zinc-500 text-center max-w-md">
          Physics constants are determined by community vote.
          Submit a PR modifying <code className="text-zinc-400">src/config/physics.ts</code> to propose changes.
        </p>
      </section>

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
