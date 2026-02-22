"use client";

import { useState, useEffect } from "react";

export type Section = "votes" | "rising" | "new" | "discussed" | "controversial";

const VALID_SECTIONS: Section[] = ["votes", "rising", "new", "discussed", "controversial"];

export function useSectionNav(defaultSection: Section = "votes") {
  const [activeSection, setActiveSection] = useState<Section>(defaultSection);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Section;
      if (VALID_SECTIONS.includes(hash)) {
        setActiveSection(hash);
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    try { history.replaceState(null, "", `#${activeSection}`); } catch {}
  }, [activeSection]);

  return { activeSection, setActiveSection };
}
