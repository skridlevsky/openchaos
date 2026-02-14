export default function NotFound() {
  return(
      <main className="min-h-screen flex flex-col items-center px-4 py-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
           <a href="../">OPENCHAOS.DEV</a>
        </h1>
        <div className="mt-12">
           <img src="https://http.cat/404" alt="404"/>
        </div>
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