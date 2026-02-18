export function Web2SocialBookmarks() {
  return (
    <div className="web2-widget">
      <div className="web2-widget-header">Share This</div>
      <div className="web2-widget-body">
        <div className="web2-social-bookmarks">
          <a
            href="https://digg.com/submit?url=https://openchaos.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="web2-social-link"
          >
            <span className="web2-social-icon" style={{ color: '#1a5099' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.22 6.297h-2.743V3.61h-2.663v8.688h5.407V6.297zm0 4.292h-2.743V8.006h2.743v2.583zm-6.408-4.292h-2.662v5.997h5.324V6.297h-2.662zm0 4.292h-2.662V8.006h2.662v2.583zM7.405 3.61H4.742V6.297H2.08v5.997h5.324V6.297h-.001V3.61zm0 6.686H4.742V8.006h2.663v2.29z" />
              </svg>
            </span>
            <span>Digg this</span>
          </a>
          <a
            href="https://www.stumbleupon.com/submit?url=https://openchaos.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="web2-social-link"
          >
            <span className="web2-social-icon" style={{ color: '#eb4924' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6H7v-2h4v8zm6-4h-4v4h-2v-4H9v-2h2V9h2v2h4v2z" />
              </svg>
            </span>
            <span>StumbleUpon</span>
          </a>
          <a
            href="https://del.icio.us/post?url=https://openchaos.dev&title=OpenChaos"
            target="_blank"
            rel="noopener noreferrer"
            className="web2-social-link"
          >
            <span className="web2-social-icon" style={{ color: '#3274d1' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="8" cy="8" r="4" />
                <circle cx="16" cy="16" r="4" />
              </svg>
            </span>
            <span>del.icio.us</span>
          </a>
          <a
            href="https://reddit.com/submit?url=https://openchaos.dev&title=OpenChaos"
            target="_blank"
            rel="noopener noreferrer"
            className="web2-social-link"
          >
            <span className="web2-social-icon" style={{ color: '#ff4500' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-6.996 4.87-3.868 0-6.998-2.176-6.998-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25 8 13.938 8.56 14.5 9.25 14.5s1.25-.562 1.25-1.25c0-.688-.56-1.25-1.25-1.25zm5.5 0c-.69 0-1.25.562-1.25 1.25 0 .688.56 1.25 1.25 1.25s1.25-.562 1.25-1.25c0-.688-.56-1.25-1.25-1.25zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z" />
              </svg>
            </span>
            <span>Reddit</span>
          </a>
        </div>
      </div>
    </div>
  );
}
