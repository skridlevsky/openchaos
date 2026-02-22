export function Web2Footer() {
  return (
    <footer className="web2-footer">
      <div className="web2-footer-columns">
        <div className="web2-footer-col">
          <div className="web2-footer-col-title">OpenChaos</div>
          <a href="https://github.com/skridlevsky/openchaos" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
          <a href="https://blog.openchaos.dev/" target="_blank" rel="noopener noreferrer">Blog</a>
          <a href="https://discord.gg/6S5T5DyzZq" target="_blank" rel="noopener noreferrer">Discord Community</a>
        </div>
        <div className="web2-footer-col">
          <div className="web2-footer-col-title">Resources</div>
          <a href="https://github.com/skridlevsky/openchaos/pulls" target="_blank" rel="noopener noreferrer">Open Pull Requests</a>
          <a href="https://github.com/skridlevsky/openchaos/issues" target="_blank" rel="noopener noreferrer">Issues</a>
          <a href="https://github.com/skridlevsky/openchaos/wiki" target="_blank" rel="noopener noreferrer">Wiki</a>
        </div>
        <div className="web2-footer-col">
          <div className="web2-footer-col-title">About</div>
          <a href="https://github.com/skridlevsky/openchaos#readme" target="_blank" rel="noopener noreferrer">How It Works</a>
          <a href="https://github.com/skridlevsky/openchaos/graphs/contributors" target="_blank" rel="noopener noreferrer">Contributors</a>
          <a href="https://github.com/skridlevsky/openchaos/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">License</a>
        </div>
      </div>
      <div className="web2-footer-bottom">
        <p>OpenChaos.dev — A self-evolving open source project. Vote on PRs. Winner gets merged daily.</p>
        <p style={{ marginTop: '4px' }}>Updated daily at 19:00 UTC · Webmaster: skridlevsky@geocities.com</p>
      </div>
    </footer>
  );
}
