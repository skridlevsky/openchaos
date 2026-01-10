"use client";

import { useEffect, useRef } from "react";

interface Ripple {
    x: number;
    y: number;
    startTime: number;
}

interface TrailPoint {
    x: number;
    y: number;
    opacity: number;
}

export function InteractiveEffects() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ripplesRef = useRef<Ripple[]>([]);
    const trailRef = useRef<TrailPoint[]>([]);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const handleClick = (e: MouseEvent) => {
            ripplesRef.current.push({
                x: e.clientX,
                y: e.clientY,
                startTime: performance.now(),
            });
        };

        const handleMouseMove = (e: MouseEvent) => {
            trailRef.current.push({
                x: e.clientX,
                y: e.clientY,
                opacity: 1,
            });
            if (trailRef.current.length > 50) {
                trailRef.current.shift();
            }
        };

        window.addEventListener("click", handleClick);
        window.addEventListener("mousemove", handleMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const now = performance.now();
            const duration = 2000;
            const waveCount = 5;
            const maxRadius = 200;
            const waveSpacing = 25;

            ripplesRef.current = ripplesRef.current.filter((ripple) => {
                const elapsed = now - ripple.startTime;
                if (elapsed >= duration) return false;

                const progress = elapsed / duration;
                const baseRadius = progress * maxRadius;

                // Draw multiple concentric waves
                for (let i = 0; i < waveCount; i++) {
                    const waveOffset = i * waveSpacing;
                    const radius = baseRadius - waveOffset;

                    if (radius <= 0) continue;

                    // Wave amplitude decreases with distance and time
                    const distanceFade = 1 - radius / maxRadius;
                    const timeFade = 1 - progress;
                    // Sinusoidal wave pattern - creates peaks and troughs
                    const wave = Math.sin((radius * 0.15) - (elapsed * 0.008));
                    const waveIntensity = (wave + 1) / 2; // Normalize to 0-1

                    const alpha = distanceFade * timeFade * waveIntensity * 0.5;
                    const lineWidth = Math.max(0.5, (1 - progress) * (2 - i * 0.3));

                    ctx.beginPath();
                    ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(80, 140, 200, ${alpha})`;
                    ctx.lineWidth = lineWidth;
                    ctx.stroke();
                }

                return true;
            });

            // Draw trail
            if (trailRef.current.length > 1) {
                ctx.beginPath();
                ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);

                for (let i = 1; i < trailRef.current.length; i++) {
                    ctx.lineTo(trailRef.current[i].x, trailRef.current[i].y);
                }

                ctx.strokeStyle = "rgba(120, 120, 120, 0.4)";
                ctx.lineWidth = 2;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.stroke();

                trailRef.current = trailRef.current
                    .map((p) => ({ ...p, opacity: p.opacity - 0.02 }))
                    .filter((p) => p.opacity > 0);
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("click", handleClick);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
        />
    );
}
