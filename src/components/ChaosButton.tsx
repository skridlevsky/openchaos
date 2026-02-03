"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const CHAOS_EFFECTS = [
  { name: "Matrix Rain", effect: "matrix" },
  { name: "Earthquake", effect: "earthquake" },
  { name: "Upside Down", effect: "upside-down" },
  { name: "Color Chaos", effect: "color-chaos" },
  { name: "Spinning", effect: "spinning" },
  { name: "Blur Vision", effect: "blur" },
  { name: "Ghost Trail", effect: "ghost" },
  { name: "Random Emoji Rain", effect: "emoji" },
];

export function ChaosButton() {
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const chaosIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chaosElementsRef = useRef<HTMLElement[]>([]);

  const triggerChaos = () => {
    const randomEffect = CHAOS_EFFECTS[Math.floor(Math.random() * CHAOS_EFFECTS.length)];
    setActiveEffect(randomEffect.effect);
    applyChaosEffect(randomEffect.effect);
  };

  const stopChaos = () => {
    setActiveEffect(null);
    stopAllChaos();
  };

  const applyChaosEffect = (effect: string) => {
    stopAllChaos();

    switch (effect) {
      case "matrix":
        createMatrixRain();
        break;
      case "earthquake":
        createEarthquake();
        break;
      case "upside-down":
        document.body.style.transform = "rotate(180deg)";
        break;
      case "color-chaos":
        startColorChaos();
        break;
      case "spinning":
        startSpinning();
        break;
      case "blur":
        startBlur();
        break;
      case "ghost":
        createGhostTrail();
        break;
      case "emoji":
        createEmojiRain();
        break;
    }
  };

  const stopAllChaos = () => {
    if (chaosIntervalRef.current) {
      clearInterval(chaosIntervalRef.current);
      chaosIntervalRef.current = null;
    }

    document.body.style.transform = "";
    document.body.style.filter = "";
    chaosElementsRef.current.forEach(el => el.remove());
    chaosElementsRef.current = [];

    const allRotating = document.querySelectorAll(".chaos-spinning");
    allRotating.forEach(el => {
      (el as HTMLElement).style.animation = "none";
    });
  };

  const createMatrixRain = () => {
    const columns = Math.floor(window.innerWidth / 20);
    const canvas = document.createElement("canvas");
    canvas.id = "chaos-matrix";
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 9999;
      pointer-events: none;
      opacity: 0.7;
    `;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    chaosElementsRef.current.push(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drops = Array(columns).fill(1);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";

    chaosIntervalRef.current = setInterval(() => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0F0";
      ctx.font = "15px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 50);
  };

  const createEarthquake = () => {
    chaosIntervalRef.current = setInterval(() => {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      document.body.style.transform = `translate(${x}px, ${y}px)`;
    }, 50);
  };

  const startColorChaos = () => {
    let hue = 0;
    chaosIntervalRef.current = setInterval(() => {
      hue = (hue + 5) % 360;
      document.body.style.filter = `hue-rotate(${hue}deg)`;
    }, 100);
  };

  const startSpinning = () => {
    const allElements = document.querySelectorAll("body > *");
    allElements.forEach(el => {
      (el as HTMLElement).classList.add("chaos-spinning");
      (el as HTMLElement).style.animation = `chaos-spin ${0.5 + Math.random() * 2}s linear infinite`;
    });
    chaosElementsRef.current = Array.from(allElements) as HTMLElement[];
  };

  const startBlur = () => {
    let blurAmount = 0;
    let increasing = true;

    chaosIntervalRef.current = setInterval(() => {
      if (increasing) {
        blurAmount += 0.1;
        if (blurAmount > 3) increasing = false;
      } else {
        blurAmount -= 0.1;
        if (blurAmount < 0) increasing = true;
      }
      document.body.style.filter = `blur(${blurAmount}px)`;
    }, 50);
  };

  const createGhostTrail = () => {
    const handleMove = (e: MouseEvent) => {
      const ghost = document.createElement("div");
      ghost.className = "chaos-ghost";
      ghost.style.cssText = `
        position: fixed;
        left: ${e.clientX - 25}px;
        top: ${e.clientY - 25}px;
        width: 50px;
        height: 50px;
        pointer-events: none;
        z-index: 9998;
        background: rgba(0, 255, 255, 0.3);
        border-radius: 50%;
        transition: opacity 0.3s ease-out;
      `;
      document.body.appendChild(ghost);
      chaosElementsRef.current.push(ghost);

      setTimeout(() => {
        ghost.style.opacity = "0";
        setTimeout(() => ghost.remove(), 300);
      }, 100);
    };

    document.addEventListener("mousemove", handleMove);
    chaosIntervalRef.current = setTimeout(() => {
      document.removeEventListener("mousemove", handleMove);
    }, 10000);
  };

  const createEmojiRain = () => {
    const emojis = ["💀", "🔥", "💀", "⚡", "💀", "🎮", "💀", "🚀", "💀", "🌈"];

    chaosIntervalRef.current = setInterval(() => {
      const emoji = document.createElement("div");
      const emojiChar = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.className = "chaos-emoji";
      emoji.textContent = emojiChar;
      emoji.style.cssText = `
        position: fixed;
        left: ${Math.random() * window.innerWidth}px;
        top: -30px;
        font-size: ${20 + Math.random() * 20}px;
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(emoji);
      chaosElementsRef.current.push(emoji);

      let pos = -30;
      const fall = setInterval(() => {
        pos += 5 + Math.random() * 5;
        emoji.style.top = pos + "px";
        if (pos > window.innerHeight) {
          emoji.remove();
          clearInterval(fall);
        }
      }, 20);
    }, 200);
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes chaos-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    chaosElementsRef.current.push(style);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={activeEffect ? stopChaos : triggerChaos}
        className={`
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          z-[9999]
          px-6 py-3 text-xl font-bold
          border-4 border-white shadow-2xl
          rounded-lg
          transition-all duration-200
          hover:scale-110 active:scale-95
          ${activeEffect ? "bg-red-600 animate-pulse" : "bg-yellow-400 hover:bg-yellow-300"}
        `}
        style={{ fontFamily: "Comic Sans MS, cursive" }}
      >
        {activeEffect ? "🛑 STOP THE CHAOS" : "🌀 TRIGGER CHAOS"}
      </button>
      {activeEffect && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded z-[9998] border-2 border-red-500">
          🎰 CHAOS ACTIVE: {CHAOS_EFFECTS.find(e => e.effect === activeEffect)?.name}
        </div>
      )}
    </>
  );
}
