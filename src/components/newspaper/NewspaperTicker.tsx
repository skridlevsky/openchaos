const TICKER_MESSAGES = [
  "EXTRA! EXTRA! Community votes decide what code ships next!",
  "BULLETIN: Daily merge occurs at 19:00 UTC sharp — cast your ballot!",
  "DISPATCH: OpenChaos — the self-evolving open source experiment",
  "FLASH: PRs with most votes get merged — democracy in action!",
  "NOTICE: Merge conflicts disqualify — keep your branches clean!",
  "REPORT: Rhyming PR titles required — no rhyme, no reason, no merge!",
  "WIRE: Fork, code, submit — let the people decide!",
  "UPDATE: The code IS the website — every merged PR changes this page!",
];

export function NewspaperTicker() {
  // Doubled for seamless infinite scroll (CSS animates to -50%)
  const doubled = [...TICKER_MESSAGES, ...TICKER_MESSAGES];

  return (
    <div className="np-ticker-wrap">
      <span className="np-ticker-label">BREAKING</span>
      <span className="np-ticker-track">
        {doubled.map((msg, i) => (
          <span key={i} className="np-ticker-item">
            {msg}
            <span className="np-ticker-bullet">&bull;</span>
          </span>
        ))}
      </span>
    </div>
  );
}
