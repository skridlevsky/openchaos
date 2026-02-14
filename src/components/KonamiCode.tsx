"use client";

import { useEffect, useState, useCallback } from "react";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

function meowifyPage() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  const textNodes: Text[] = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue && node.nodeValue.trim()) {
      textNodes.push(node as Text);
    }
  }

  textNodes.forEach((textNode) => {
    if (textNode.nodeValue) {
      textNode.nodeValue = textNode.nodeValue.replace(/\b\w+\b/g, "meow");
    }
  });
}

export function KonamiCode() {
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const [activated, setActivated] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (activated) return;

      const key = event.code;
      const newSequence = [...inputSequence, key].slice(-KONAMI_CODE.length);
      setInputSequence(newSequence);

      if (newSequence.length === KONAMI_CODE.length) {
        const isMatch = newSequence.every(
          (k, i) => k === KONAMI_CODE[i]
        );
        if (isMatch) {
          setActivated(true);
          meowifyPage();
        }
      }
    },
    [inputSequence, activated]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null;
}
