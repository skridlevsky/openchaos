import { Suspense } from "react";
import { Countdown } from "@/components/Countdown";
import { PRList } from "@/components/PRList";
import { ProceduralArt } from "@/components/ProceduralArt";

export default function Home() {
  return (
    <main className="min-h-screen relative font-sans flex flex-col lg:flex-row overflow-x-hidden text-white">
      <ProceduralArt />

      {/* Center Overlay: Title & Countdown */}
      <div className="relative z-10 flex-1 flex flex-col items-start justify-start min-h-[40dvh] lg:min-h-screen p-6 lg:p-12 pointer-events-none">
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 text-left shadow-2xl max-w-2xl w-full pointer-events-auto">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight drop-shadow-md mb-2 font-sans">
            OPENCHAOS.DEV
          </h1>

          <p className="text-white/80 text-lg mb-6 font-medium font-sans">
            <a
              href="https://github.com/skridlevsky/openchaos"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white underline decoration-white/30 hover:decoration-white transition-all"
            >
              A self-evolving open source project.
            </a>
          </p>

          <div className="drop-shadow-sm">
            <Countdown />
          </div>
        </div>
      </div>

      {/* Right Side Panel: PR List */}
      <div className="relative z-10 w-full lg:w-[400px] flex-none bg-black/40 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-[600px] lg:h-screen transition-all shadow-xl">
        <div className="p-4 border-b border-white/10 flex-none bg-black/20">
          <h2 className="text-lg font-bold text-white/90 flex items-center gap-2 font-sans">
            <span>🗳️</span> Vote to Merge
          </h2>
          <p className="text-white/60 text-xs mt-1 font-sans">
            Top voted PR gets merged Sunday 9PM UTC
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <Suspense
            fallback={
              <div className="text-center py-12">
                <div className="animate-spin text-3xl mb-4">⌛</div>
                <p className="text-white/60">Loading...</p>
              </div>
            }
          >
            <PRList />
          </Suspense>
        </div>

        <div className="p-4 border-t border-white/10 flex-none text-center bg-white/5 lg:hidden">
          <a
            href="https://github.com/skridlevsky/openchaos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors text-sm font-medium border border-white/10"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </main>
  );
}
