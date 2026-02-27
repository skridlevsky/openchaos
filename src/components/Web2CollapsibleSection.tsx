"use client";

import { useState, ReactNode } from "react";

interface Web2CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function Web2CollapsibleSection({ title, children, defaultExpanded = false }: Web2CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="web2-section">
      <div 
        className="web2-section-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        <span className="web2-section-title">
          {isExpanded ? "▼" : "▶"} {title}
        </span>
      </div>
      {isExpanded && (
        <div className="web2-section-body">
          {children}
        </div>
      )}
    </div>
  );
}
