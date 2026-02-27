"use client";

import { useState, ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function CollapsibleSection({ title, subtitle, children, defaultExpanded = false }: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div>
      <hr className="np-rule-double" />
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        <div className="np-archives-header">
          {isExpanded ? "▼" : "▶"} {title}
        </div>
        {subtitle && <div className="np-archives-subheader">{subtitle}</div>}
      </div>
      <hr className="np-rule-single" />
      {isExpanded && children}
    </div>
  );
}
