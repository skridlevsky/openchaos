"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const CHAOS_PASSAGES = [
  "The OpenChaos project evolves each week as the community votes on pull requests and the winner gets merged into the main codebase.",
  "Every Saturday at nineteen hundred UTC the top voted PR is automatically merged and deployed to production by Vercel.",
  "The website IS the repo and the repo IS the website making OpenChaos one of a kind self-evolving experiment.",
  "Fork and submit your PR to join the chaos where rhyming titles are mandatory and votes determine the fate of code.",
  "Chaos reins supreme in this repository where democracy meets cryptography and every developer is a potential winner.",
  "Build wild features or subtle improvements submit your work and let the community decide what deserves to survive.",
];

function getRandomPassage(): string {
  return CHAOS_PASSAGES[Math.floor(Math.random() * CHAOS_PASSAGES.length)];
}

interface TypingResult {
  wpm: number;
  accuracy: number;
  time: number;
}

function calculateWPM(charsTyped: number, seconds: number): number {
  const words = charsTyped / 5;
  const minutes = seconds / 60;
  return minutes > 0 ? Math.round(words / minutes) : 0;
}

function calculateAccuracy(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

export function TypingSpeedTest() {
  const [passage, setPassage] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const newPassage = useCallback(() => {
    const p = getRandomPassage();
    setPassage(p);
    setUserInput("");
    setIsStarted(false);
    setIsFinished(false);
    setStartTime(null);
    setResult(null);
    setElapsed(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    newPassage();
  }, [newPassage]);

  useEffect(() => {
    if (isStarted && !isFinished) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - (startTime ?? Date.now())) / 1000));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStarted, isFinished, startTime]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUserInput(value);

    if (!isStarted && value.length > 0) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    if (value.length === passage.length || (value.length >= passage.length)) {
      setIsFinished(true);
      if (startTime) {
        const seconds = (Date.now() - startTime) / 1000;
        let correct = 0;
        for (let i = 0; i < Math.min(value.length, passage.length); i++) {
          if (value[i] === passage[i]) correct++;
        }
        const wpm = calculateWPM(correct, seconds);
        const accuracy = calculateAccuracy(correct, passage.length);
        setResult({ wpm, accuracy, time: Math.round(seconds) });
      }
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const correctChars = Array.from({ length: Math.min(userInput.length, passage.length) }, (_, i) =>
    userInput[i] === passage[i] ? passage[i] : null
  );
  const wrongChars = Array.from({ length: Math.min(userInput.length, passage.length) }, (_, i) =>
    userInput[i] !== passage[i] ? userInput[i] : null
  );

  return (
    <div className="type-test-container">
      <div className="type-test-header">
        <span className="type-test-title">///// TYPING SPEED TEST /////</span>
        <button
          onClick={newPassage}
          className="type-test-new-btn"
          title="New passage"
        >
          [NEW]
        </button>
      </div>

      {!isFinished ? (
        <>
          <div className="type-test-stats">
            <span>TIME: {formatTime(elapsed)}</span>
            <span>CHARS: {userInput.length}/{passage.length}</span>
          </div>
          <div className="type-test-passage">
            <span className="type-test-correct">
              {passage.split("").map((char, i) => {
                const typed = userInput[i];
                if (typed === undefined) return <span key={i} className="type-pending">{char}</span>;
                if (typed === char) return <span key={i} className="type-correct">{char}</span>;
                return <span key={i} className="type-wrong">{char}</span>;
              })}
            </span>
          </div>
          <textarea
            ref={textareaRef}
            className="type-test-input"
            value={userInput}
            onChange={handleInput}
            placeholder="Start typing to begin..."
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <div className="type-test-hint">
            {!isStarted && <span>&gt;&gt; Start typing to begin the test &lt;&lt;</span>}
            {isStarted && !isFinished && <span>&gt;&gt; Keep going... &lt;&lt;</span>}
          </div>
        </>
      ) : (
        <div className="type-test-results">
          <div className="type-result-title">&gt;&gt; TEST COMPLETE &lt;&lt;</div>
          <div className="type-result-row">
            <span>WPM:</span>
            <span className="type-result-value">{result?.wpm}</span>
          </div>
          <div className="type-result-row">
            <span>ACCURACY:</span>
            <span className="type-result-value">{result?.accuracy}%</span>
          </div>
          <div className="type-result-row">
            <span>TIME:</span>
            <span className="type-result-value">{formatTime(result?.time ?? 0)}</span>
          </div>
          <div className="type-result-row">
            <span>CHARS:</span>
            <span className="type-result-value">{userInput.length}</span>
          </div>
          <button onClick={newPassage} className="type-test-new-btn">
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
