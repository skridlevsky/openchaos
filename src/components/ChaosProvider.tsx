"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { getTextNodes, shuffleContent, stopScramble } from "@/utils/real-chaos";

const ChaosContext = createContext<{ isChaos: boolean; toggleChaos: () => void } | null>(null);

export const useChaos = () => {
  const ctx = useContext(ChaosContext);
  if (!ctx) throw new Error("useChaos must be used within ChaosProvider");
  return ctx;
};

export function ChaosProvider({ children }: { children: React.ReactNode }) {
   /**
    * fccview here, I'm not too mean, I've implemented this lovely totally needed
    * check for future implementation in case the next mad person wants to keep my code
    * but stop the chaos.
    */
  const [isChaos, setIsChaos] = useState(false);
  const observer = useRef<MutationObserver | null>(null);
  const content = useRef<Map<Text, string>>(new Map());

  const apply = useCallback(() => shuffleContent(getTextNodes(document.body), content.current), []);

  const reset = useCallback(() => {
    content.current.forEach((text, node) => {
      stopScramble(node);
      node.textContent = text;
    });
  }, []);

  useEffect(() => {
    if (!isChaos) return reset();

    apply();
    const interval = setInterval(apply, 10000);
    
    observer.current = new MutationObserver((m) => m.some(x => x.addedNodes.length) && setTimeout(apply, 100));
    observer.current.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(interval);
      observer.current?.disconnect();
    };
  }, [isChaos, apply, reset]);

  useEffect(() => { setTimeout(() => setIsChaos(true), 100); }, []);

  return (
    <ChaosContext.Provider value={{ isChaos, toggleChaos: () => setIsChaos(p => !p) }}>
      {children}
    </ChaosContext.Provider>
  );
}