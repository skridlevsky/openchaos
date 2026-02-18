'use client'

import { useState, useEffect } from "react";
import { WorldChaos } from "@/components/WorldChaos";

export interface ControlledChaosProps {
}

export function ControlledChaos() {

  const [scramble_words, setScrambleWords] = useState(true);

  const buttonText = scramble_words ? "Decrypt" : "Encrypt";

  const toggleScramble = () => {
    setScrambleWords(!scramble_words);
  };

  return (
    <div className="ccContainer">
      <h1>Control vs Chaos</h1>
      <div>
        <WorldChaos scramble_words={scramble_words} rotateInterval={3000} url="/api/world-chaos" />
      </div>
      <button className="chaos-toggle-button" onClick={toggleScramble} data-state={scramble_words ? 'decrypt' : 'encrypt'}>
        {buttonText}
      </button>
    </div>
  );
}