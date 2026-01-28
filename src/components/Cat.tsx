"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export function Cat() {
  // starts in the corner
  // drag it around
  // drops back down
  // looks where it goes
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  // default true (facing left) because it starts on the right
  const [isFlipped, setIsFlipped] = useState(true);

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

      // drop to bottom, final position
      const rect = catRef.current.getBoundingClientRect();
      const screenHeight = window.innerHeight;
      const catHeight = rect.height;

      const targetY = screenHeight - catHeight;

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    setIsSettling(false);

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

  return (
    <div
      ref={catRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`fixed z-50 cursor-grab active:cursor-grabbing select-none touch-none
        ${!position ? "bottom-0 right-0" : "top-0 left-0"}
        ${isSettling ? "transition-transform duration-500 ease-out" : ""}
      `}
      style={{
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

