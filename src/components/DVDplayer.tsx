"use client";

import { useState, useEffect, useRef } from "react";

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  dx: number;
  dy: number;
}

export const DVDPlayer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const [position, setPosition] = useState<Position>({ x: 50, y: 50 });
  const [velocity, setVelocity] = useState<Velocity>({ dx: 2, dy: 1.5 });
  const [color, setColor] = useState(0);
  
  const colors = [
    "text-red-500",
    "text-blue-500", 
    "text-green-500",
    "text-yellow-500",
    "text-purple-500",
    "text-pink-500",
    "text-orange-500",
    "text-cyan-500",
    "text-lime-500",
    "text-indigo-500"
  ];

  useEffect(() => {
    const container = containerRef.current;
    const logo = logoRef.current;
    
    if (!container || !logo) return;

    const animate = () => {
      const containerRect = container.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      
      // Calculate current position relative to container
      const currentX = position.x;
      const currentY = position.y;
      
      // Calculate new position
      let newX = currentX + velocity.dx;
      let newY = currentY + velocity.dy;
      let newDx = velocity.dx;
      let newDy = velocity.dy;
      let hitWall = false;

      // Logo dimensions (approximate)
      const logoWidth = 250;
      const logoHeight = 40;

      // Check collision with walls
      if (newX <= 0 || newX >= containerRect.width - logoWidth) {
        newDx = -velocity.dx;
        newX = newX <= 0 ? 0 : containerRect.width - logoWidth;
        hitWall = true;
      }

      if (newY <= 0 || newY >= containerRect.height - logoHeight) {
        newDy = -velocity.dy;
        newY = newY <= 0 ? 0 : containerRect.height - logoHeight;
        hitWall = true;
      }

      // Update position and velocity
      setPosition({ x: newX, y: newY });
      setVelocity({ dx: newDx, dy: newDy });

      // Change color on wall hit
      if (hitWall) {
        setColor((prevColor) => (prevColor + 1) % colors.length);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [position, velocity, colors.length]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ minHeight: "400px" }}
    >
      <div
        ref={logoRef}
        className={`absolute ${colors[color]} font-extrabold px-3 py-1 transition-colors duration-200 select-none`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          fontSize: "24px",
          letterSpacing: "2px",
          transform: "translateZ(0)",
          willChange: "transform"
        }}
      >
        OPENCHAOS.DEV 
      </div>
      
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)"
        }}
      />
    </div>
  );
};