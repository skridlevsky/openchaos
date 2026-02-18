export function Web2TagCloud() {
  const tags = [
    { label: "javascript", size: 18 },
    { label: "react", size: 16 },
    { label: "nextjs", size: 15 },
    { label: "opensource", size: 20 },
    { label: "community", size: 14 },
    { label: "voting", size: 17 },
    { label: "css", size: 13 },
    { label: "web2.0", size: 19 },
    { label: "chaos", size: 16 },
    { label: "pull-requests", size: 15 },
    { label: "github", size: 14 },
    { label: "typescript", size: 13 },
    { label: "tailwind", size: 12 },
    { label: "merge", size: 14 },
    { label: "democracy", size: 11 },
    { label: "ajax", size: 12 },
    { label: "beta", size: 13 },
    { label: "social", size: 11 },
  ];

  return (
    <div className="web2-widget">
      <div className="web2-widget-header">Tag Cloud</div>
      <div className="web2-widget-body">
        <div className="web2-tag-cloud">
          {tags.map((tag) => (
            <span
              key={tag.label}
              className="web2-tag"
              style={{ fontSize: `${tag.size}px` }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
