"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface CatProps {
  isMidiPlayerOpen: boolean;
}

export function Cat({ isMidiPlayerOpen }: CatProps) {
  // starts on the midi player
  // drag it around
  // drops back down
  // looks where it goes
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  // default false (facing right) because it starts on the left now
  const [isFlipped, setIsFlipped] = useState(false);
  // Track if cat has been manually positioned (dragged)
  const [hasBeenDragged, setHasBeenDragged] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const lastX = useRef(0);

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      setPosition({ x: newX, y: newY });

      // face direction of movement
      if (Math.abs(e.movementX) > 0) {
        setIsFlipped(e.movementX < 0);
      }
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      const touch = e.touches[0];
      const movementX = touch.clientX - lastX.current;
      lastX.current = touch.clientX;

      const newX = touch.clientX - dragOffset.current.x;
      const newY = touch.clientY - dragOffset.current.y;

      setPosition({ x: newX, y: newY });

      if (Math.abs(movementX) > 0) {
        setIsFlipped(movementX < 0);
      }
    };

    const handleWindowEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);

      if (!catRef.current) return;

      setIsSettling(true);

      // drop to bottom, final position (on top of status bar)
      const rect = catRef.current.getBoundingClientRect();
      const screenHeight = window.innerHeight;
      const catHeight = rect.height;
      const statusBarHeight = 22;

      const targetY = screenHeight - catHeight - statusBarHeight;

      const targetX = rect.left; // current x

      setPosition({ x: targetX, y: targetY });

      const screenCenter = window.innerWidth / 2;
      const catCenter = targetX + rect.width / 2;

      if (catCenter < screenCenter) {
        // face right on left side
        setIsFlipped(false);
      } else {
        // face left on right side
        setIsFlipped(true);
      }

      setTimeout(() => {
        setIsSettling(false);
      }, 500);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleWindowMouseMove);
      window.addEventListener("mouseup", handleWindowEnd);
      window.addEventListener("touchmove", handleWindowTouchMove, { passive: false });
      window.addEventListener("touchend", handleWindowEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowEnd);
      window.removeEventListener("touchmove", handleWindowTouchMove);
      window.removeEventListener("touchend", handleWindowEnd);
    };
  }, [isDragging]);

  // When midi player closes (and cat hasn't been dragged), make the cat fall
  useEffect(() => {
    if (!isMidiPlayerOpen && !hasBeenDragged && catRef.current) {
      const screenHeight = window.innerHeight;
      const catHeight = catRef.current.getBoundingClientRect().height;
      const statusBarHeight = 22;

      // First rAF: set position to where the cat currently is (on top of player)
      // This converts from bottom-based positioning to top-based transform
      let innerFrameId: number;
      const frameId = requestAnimationFrame(() => {
        const startY = screenHeight - 200 - catHeight; // 200px is the bottom offset
        setPosition({ x: 20, y: startY });

        // Second rAF: animate to the bottom after the starting position is painted
        innerFrameId = requestAnimationFrame(() => {
          setIsSettling(true);
          // Fall to sit on top of the status bar
          const targetY = screenHeight - catHeight - statusBarHeight;
          setPosition({ x: 20, y: targetY });
        });
      });

      const timerId = setTimeout(() => {
        setIsSettling(false);
      }, 600);

      return () => {
        cancelAnimationFrame(frameId);
        cancelAnimationFrame(innerFrameId);
        clearTimeout(timerId);
      };
    }
  }, [isMidiPlayerOpen, hasBeenDragged]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    setIsSettling(false);
    setHasBeenDragged(true);

    if (catRef.current) {
      const rect = catRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      lastX.current = e.clientX;

      setPosition({ x: rect.left, y: rect.top });
    }

    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsSettling(false);
    setHasBeenDragged(true);

    if (catRef.current) {
      const rect = catRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      dragOffset.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
      lastX.current = touch.clientX;

      setPosition({ x: rect.left, y: rect.top });
    }

    setIsDragging(true);
  };

  // Determine default position based on midi player state
  const getDefaultPositionClass = () => {
    if (position) return "top-0 left-0"; // being dragged or fallen
    if (isMidiPlayerOpen) return ""; // will use style for precise positioning
    return "bottom-0 left-5"; // player closed, sit at bottom-left
  };

  return (
    <div
      ref={catRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`fixed z-[1001] cursor-grab active:cursor-grabbing select-none touch-none
        ${getDefaultPositionClass()}
        ${isSettling ? "transition-transform duration-500 ease-out" : ""}
      `}
      style={{
        // When not dragged and player is open, position on top of the player
        ...(!position && isMidiPlayerOpen ? {
          bottom: "200px", // above the midi player
          left: "20px",
        } : {}),
        transform: position
          ? `translate3d(${position.x}px, ${position.y}px, 0)`
          : undefined,
      }}
    >
      <Image
        src="/cat.gif" // 16KB
        alt="Chaos Cat"
        width={128}
        height={128}
        className={`h-auto w-32 ${isFlipped ? "-scale-x-100" : "scale-x-100"}`}
        unoptimized
        draggable={false}
      />
    </div>
  );
}

