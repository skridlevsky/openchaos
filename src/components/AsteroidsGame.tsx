"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { PhysicsConfig } from "@/config/physics";
import type { GameState, InputState } from "@/lib/game/types";
import { createInitialState, updateGame } from "@/lib/game/engine";

interface AsteroidsGameProps {
  physics: PhysicsConfig;
}

export function AsteroidsGame({ physics }: AsteroidsGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    thrust: false,
    shoot: false,
  });
  const lastShootTimeRef = useRef(0);
  const animationRef = useRef<number>(0);

  const initGame = useCallback(() => {
    setGameState(createInitialState(dimensions.width, dimensions.height, physics));
    lastShootTimeRef.current = 0;
  }, [dimensions.width, dimensions.height, physics]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.clientWidth, 800);
        const height = Math.min(width * 0.6, 480);
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Initialize game when dimensions change
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          inputRef.current.left = true;
          break;
        case "ArrowRight":
        case "KeyD":
          inputRef.current.right = true;
          break;
        case "ArrowUp":
        case "KeyW":
          inputRef.current.thrust = true;
          break;
        case "Space":
          inputRef.current.shoot = true;
          e.preventDefault();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          inputRef.current.left = false;
          break;
        case "ArrowRight":
        case "KeyD":
          inputRef.current.right = false;
          break;
        case "ArrowUp":
        case "KeyW":
          inputRef.current.thrust = false;
          break;
        case "Space":
          inputRef.current.shoot = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameState) return;

    const gameLoop = () => {
      setGameState((prev) => {
        if (!prev) return prev;
        const result = updateGame(prev, physics, inputRef.current, lastShootTimeRef.current);
        lastShootTimeRef.current = result.lastShootTime;
        return result.state;
      });
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState !== null, physics]);

  // Render
  useEffect(() => {
    if (!gameState || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;

    // Clear canvas
    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, width, height);

    // Draw ship
    if (gameState.ship.alive) {
      const { position, rotation, invulnerable } = gameState.ship;
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.rotate((rotation * Math.PI) / 180);

      ctx.strokeStyle = invulnerable ? "#71717a" : "#fafafa";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-10, -8);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-10, 8);
      ctx.closePath();
      ctx.stroke();

      // Draw thrust flame
      if (inputRef.current.thrust && !invulnerable) {
        ctx.strokeStyle = "#f97316";
        ctx.beginPath();
        ctx.moveTo(-5, -4);
        ctx.lineTo(-15 - Math.random() * 5, 0);
        ctx.lineTo(-5, 4);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw asteroids
    ctx.strokeStyle = "#a1a1aa";
    ctx.lineWidth = 1.5;
    for (const asteroid of gameState.asteroids) {
      ctx.save();
      ctx.translate(asteroid.position.x, asteroid.position.y);
      ctx.beginPath();
      if (asteroid.vertices.length > 0) {
        ctx.moveTo(asteroid.vertices[0].x, asteroid.vertices[0].y);
        for (let i = 1; i < asteroid.vertices.length; i++) {
          ctx.lineTo(asteroid.vertices[i].x, asteroid.vertices[i].y);
        }
        ctx.closePath();
      }
      ctx.stroke();
      ctx.restore();
    }

    // Draw bullets
    ctx.fillStyle = "#fafafa";
    for (const bullet of gameState.bullets) {
      ctx.beginPath();
      ctx.arc(bullet.position.x, bullet.position.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw UI
    ctx.fillStyle = "#71717a";
    ctx.font = "14px monospace";
    ctx.fillText(`SCORE: ${gameState.score}`, 10, 25);
    ctx.fillText(`LIVES: ${gameState.lives}`, 10, 45);
    ctx.fillText(`LEVEL: ${gameState.level}`, 10, 65);

    // Game over screen
    if (gameState.gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#fafafa";
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", width / 2, height / 2 - 20);
      ctx.font = "16px monospace";
      ctx.fillText(`Final Score: ${gameState.score}`, width / 2, height / 2 + 15);
      ctx.fillStyle = "#71717a";
      ctx.fillText("Press SPACE to restart", width / 2, height / 2 + 50);
      ctx.textAlign = "left";
    }
  }, [gameState, dimensions]);

  // Handle restart on game over
  useEffect(() => {
    if (!gameState?.gameOver) return;

    const handleRestart = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        initGame();
      }
    };

    window.addEventListener("keydown", handleRestart);
    return () => window.removeEventListener("keydown", handleRestart);
  }, [gameState?.gameOver, initGame]);

  return (
    <div ref={containerRef} className="w-full max-w-3xl">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="rounded-lg border border-zinc-700 w-full"
        tabIndex={0}
      />
      <div className="mt-3 flex justify-between text-xs text-zinc-500">
        <span>Arrow keys or WASD to move • Space to shoot</span>
        <button
          onClick={initGame}
          className="hover:text-zinc-300 transition-colors"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
