import { Suspense } from "react";
import { Countdown } from "@/components/Countdown";
import { PRList } from "@/components/PRList";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
        OPENCHAOS.DEV
      </h1>

      <div className="mt-12">
        <Countdown />
      </div>

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
      
      <section className="mt-16 w-full flex flex-col items-center video-wrapper">
       <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&loop=1&playlist=dQw4w9WgXcQ&controls=0"
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
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
