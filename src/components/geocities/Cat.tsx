"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export function Cat() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  const [isMidiPlayerOpen, setIsMidiPlayerOpen] = useState(true);

  const catRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const lastX = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const checkRadioOpen = () => {
      setIsMidiPlayerOpen(Boolean(document.querySelector(".gta-radio-container")));
    };

    checkRadioOpen();

    const observer = new MutationObserver(() => {
      checkRadioOpen();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      setPosition({ x: newX, y: newY });

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

      const rect = catRef.current.getBoundingClientRect();
      const screenHeight = window.innerHeight;
      const catHeight = rect.height;
      const statusBarHeight = 22;

      const targetY = screenHeight - catHeight - statusBarHeight;
      const targetX = rect.left;

      setPosition({ x: targetX, y: targetY });

      const screenCenter = window.innerWidth / 2;
      const catCenter = targetX + rect.width / 2;

      if (catCenter < screenCenter) {
        setIsFlipped(false);
      } else {
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
    if (isMidiPlayerOpen || hasBeenDragged || !catRef.current) return;

    const screenHeight = window.innerHeight;
    const catHeight = catRef.current.getBoundingClientRect().height;
    const statusBarHeight = 22;

    let innerFrameId: number;
    const frameId = requestAnimationFrame(() => {
      const startY = screenHeight - 200 - catHeight;
      setPosition({ x: 20, y: startY });

      innerFrameId = requestAnimationFrame(() => {
        setIsSettling(true);
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
  }, [isMidiPlayerOpen, hasBeenDragged]);

  // When midi player opens (and cat hasn't been dragged), walk on top of radio
  useEffect(() => {
    if (!isMidiPlayerOpen || hasBeenDragged || !catRef.current) return;
    const catEl = catRef.current;

    const getAnchorRect = (): DOMRect | null => {
      const radio = document.querySelector(".gta-radio-container") as HTMLElement | null;
      const clippy = document.querySelector(".clippy-container") as HTMLElement | null;

      if (!radio && !clippy) return null;
      if (!radio) return clippy?.getBoundingClientRect() ?? null;

      const radioSide = radio.dataset.chaosSide;
      const radioCollapsed = radio.classList.contains("gta-radio-collapsed");

      const clippyOnSameSide =
        !!clippy &&
        (clippy.dataset.chaosSide === radioSide || !clippy.dataset.chaosSide);

      if (radioCollapsed && clippyOnSameSide && clippy) {
        return clippy.getBoundingClientRect();
      }

      return radio.getBoundingClientRect();
    };

    const initialAnchor = getAnchorRect();
    if (!initialAnchor) {
      const screenHeight = window.innerHeight;
      const catHeight = catEl.getBoundingClientRect().height;
      setPosition({ x: 20, y: screenHeight - 200 - catHeight });
      return;
    }

    const initialCatRect = catEl.getBoundingClientRect();
    const initialTopY = Math.max(0, initialAnchor.top - initialCatRect.height);
    let x = initialAnchor.left;

    setPosition({ x, y: initialTopY });

    let dir = 1;
    setIsFlipped(false);
    let last = performance.now();

    const speed = 120;

    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      const anchorRect = getAnchorRect();
      const catRect = catEl.getBoundingClientRect();

      if (!anchorRect) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const topY = Math.max(0, anchorRect.top - catRect.height);
      const minX = anchorRect.left;
      const maxX = Math.max(minX, anchorRect.left + anchorRect.width - catRect.width);

      x += dir * speed * dt;
      if (x <= minX) {
        x = minX;
        dir = 1;
        setIsFlipped(false);
      } else if (x >= maxX) {
        x = maxX;
        dir = -1;
        setIsFlipped(true);
      }
      setPosition({ x, y: topY });
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
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

  const getDefaultPositionClass = () => {
    if (position) return "top-0 left-0";
    if (isMidiPlayerOpen) return "";
    return "bottom-0 left-5";
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
        ...(!position && isMidiPlayerOpen ? {
          bottom: "200px",
          left: "20px",
        } : {}),
        transform: position
          ? `translate3d(${position.x}px, ${position.y}px, 0)`
          : undefined,
      }}
    >
      <Image
        src="/cat.gif"
        alt="Cat"
        width={64}
        height={64}
        style={{
          imageRendering: "pixelated",
          transform: isFlipped ? "scaleX(-1)" : undefined,
        }}
        draggable={false}
        unoptimized
      />
    </div>
  );
}
