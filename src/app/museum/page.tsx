import Link from "next/link";
import "./museum.css";

export const metadata = {
  title: "OpenChaos Museum",
  description: "Permanent collection of digital artifacts from the OpenChaos project.",
};

export default function MuseumPage() {
  return (
    <div className="museum">
      <header className="museum-header">
        <h1 className="museum-title">OpenChaos Museum</h1>
        <p className="museum-subtitle">Permanent Collection</p>
        <nav className="museum-nav">
          <Link href="/">Home</Link>
        </nav>
      </header>

      <main className="museum-main">
        <article className="museum-exhibit">
          <div className="museum-artwork-frame">
            <img
              src="/dickbutt.gif"
              alt=""
              className="museum-artwork"
            />
          </div>
          <div className="museum-label">
            <div className="museum-label-name">Untitled (Dick Butt)</div>
            <div className="museum-label-material">Animated GIF, digital file</div>
            <div className="museum-label-date">c. 2013–2014, Anonymous</div>
            <div className="museum-label-credit">Gift of the OpenChaos community. 2026.</div>
          </div>
        </article>

        <article className="museum-exhibit">
          <div className="museum-iframe-frame">
            <iframe
              src="/doom.html"
              title="DOOM (1993)"
              className="museum-iframe"
            />
          </div>
          <div className="museum-label">
            <div className="museum-label-name">DOOM</div>
            <div className="museum-label-material">Interactive, HTML5 / Emscripten port (Freedoom), digital</div>
            <div className="museum-label-date">1993, id Software; port c. 2010s</div>
            <div className="museum-label-credit">On loan to the OpenChaos Museum. Playable in-browser.</div>
          </div>
        </article>
      </main>

      <footer className="museum-footer">
        <p>OpenChaos Museum · Digital artifacts preserved for posterity</p>
      </footer>
    </div>
  );
}
