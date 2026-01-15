"use client";

import { useEffect, useMemo } from "react";

interface ExplosionProps {
  onComplete?: () => void;
}

export function Explosion({ onComplete }: ExplosionProps) {
  const particles = useMemo(() => {
    const particleCount = 60;
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 5,
      y: 50 + (Math.random() - 0.5) * 5,
      angle: (i / particleCount) * 360 + Math.random() * 20,
      speed: 150 + Math.random() * 400,
      size: 4 + Math.random() * 20,
      delay: Math.random() * 150,
      hue: Math.random() > 0.7 ? 60 : Math.random() > 0.5 ? 30 : 0, // yellow, orange, or red
      brightness: 0.8 + Math.random() * 0.4,
    }));
  }, []);

  useEffect(() => {
    // Add shake class to body
    document.body.classList.add("shaking");

    const shakeTimer = setTimeout(() => {
      document.body.classList.remove("shaking");
    }, 800);

    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 1500);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(completeTimer);
      document.body.classList.remove("shaking");
    };
  }, [onComplete]);

  return (
    <div className="explosion-overlay">
      <div className="explosion-flash" />
      <div className="explosion-particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `hsl(${particle.hue}, 100%, 50%)`,
              boxShadow: `0 0 ${particle.size * 2}px hsl(${particle.hue}, 100%, 50%), 0 0 ${particle.size * 4}px hsl(${particle.hue}, 100%, 40%)`,
              filter: `brightness(${particle.brightness})`,
              transform: `translate(-50%, -50%)`,
            }}
            ref={(el) => {
              if (el) {
                const rad = (particle.angle * Math.PI) / 180;
                const tx = Math.cos(rad) * particle.speed;
                const ty = Math.sin(rad) * particle.speed;
                el.animate(
                  [
                    { transform: "translate(-50%, -50%) scale(1.5)", opacity: 1 },
                    { transform: "translate(-50%, -50%) scale(1.2)", opacity: 1, offset: 0.1 },
                    {
                      transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`,
                      opacity: 0,
                    },
                  ],
                  {
                    duration: 1000 + Math.random() * 500,
                    delay: particle.delay,
                    easing: "ease-out",
                    fill: "forwards",
                  }
                );
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
