"use client";

import { useState, ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function CollapsibleSection({ title, children, defaultExpanded = false }: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: "none",
          border: "1px solid #666",
          color: "inherit",
          padding: "4px 8px",
          cursor: "pointer",
          fontSize: "14px",
          marginBottom: "8px",
        }}
      >
        {isExpanded ? "[-]" : "[+]"} {title}
      </button>
      <br />
      {isExpanded && children}
    </div>
  );
}
