"use client";

import "../teletext.css";

export default function TeletextLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-variant="teletext" className="teletext-crt">
      <div className="teletext-container">
        <div className="teletext-header">
          === OPENCHAOS.DEV - TERMINAL ===
        </div>
        {children}
      </div>
    </div>
  );
}
