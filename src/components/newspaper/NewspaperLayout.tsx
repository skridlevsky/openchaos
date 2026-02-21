import type { ReactNode } from "react";
import { NewspaperTicker } from "./NewspaperTicker";

interface NewspaperLayoutProps {
  children: ReactNode;
}

export function NewspaperLayout({ children }: NewspaperLayoutProps) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const startOfYear = Date.UTC(today.getUTCFullYear(), 0, 1);
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const dayOfYear = Math.floor((now - startOfYear) / 86400000) + 1;

  return (
    <div className="np-page">
      <header className="np-masthead">
        <hr className="np-masthead-rule-top" />
        <h1 className="np-masthead-title">The Daily Chaos</h1>
        <p className="np-masthead-subtitle">&ldquo;All the Code That&apos;s Fit to Merge&rdquo;</p>
        <div className="np-masthead-meta">
          <span>Vol. I, No. {dayOfYear}</span>
          <span>{dateStr}</span>
          <span>PRICE: ONE PULL REQUEST</span>
        </div>
        <hr className="np-masthead-rule-bottom" />
      </header>

      <NewspaperTicker />

      <main>{children}</main>

      <footer className="np-footer">
        <div className="np-ornament">&sect; &bull; &sect;</div>
        <div className="np-footer-text">
          Editorial Offices: OpenChaos.dev &mdash; Established 2025
        </div>
        <div className="np-footer-links">
          <a
            href="https://github.com/skridlevsky/openchaos"
            target="_blank"
            rel="noopener noreferrer"
            className="np-footer-link"
          >
            View the Press Room
          </a>
          <a
            href="https://discord.gg/6S5T5DyzZq"
            target="_blank"
            rel="noopener noreferrer"
            className="np-footer-link"
          >
            Letters to the Editor
          </a>
        </div>
      </footer>
    </div>
  );
}
