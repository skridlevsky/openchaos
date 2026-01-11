"use client";

import { useEffect, useRef } from "react";

export function ProceduralArt() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawAbstractScene(ctx, canvas.width, canvas.height);
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    const drawAbstractScene = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number
    ) => {
        // Soft, pleasant background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        // Use HSL for pleasant pastel palettes
        const baseHue = Math.random() * 360;

        gradient.addColorStop(0, `hsl(${baseHue}, 60%, 85%)`);
        gradient.addColorStop(0.5, `hsl(${(baseHue + 40) % 360}, 50%, 90%)`);
        gradient.addColorStop(1, `hsl(${(baseHue + 90) % 360}, 60%, 85%)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw random abstract watercolor blobs
        const numBlobs = 15 + Math.random() * 10;

        for (let i = 0; i < numBlobs; i++) {
            drawWatercolorBlob(ctx, width, height, baseHue);
        }

        // Add texture
        drawTextureOverlay(ctx, width, height);
    };

    const drawWatercolorBlob = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        baseHue: number
    ) => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.min(width, height) * (0.2 + Math.random() * 0.4);

        ctx.save();
        ctx.translate(x, y);

        // Abstract shape using multiple overlapping circles/blobs
        ctx.beginPath();

        // Randomize color based on base hue but with variation
        const hue = (baseHue + Math.random() * 120 - 60) % 360;
        const sat = 50 + Math.random() * 30;
        const light = 60 + Math.random() * 20;

        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, 0.4)`; // Low opacity for watercolor feel

        // Create a blobby shape
        const points = 5 + Math.floor(Math.random() * 5);
        const angleStep = (Math.PI * 2) / points;

        ctx.moveTo(size * Math.cos(0), size * Math.sin(0));

        for (let i = 1; i <= points; i++) {
            const angle = i * angleStep;
            const r = size * (0.8 + Math.random() * 0.4); // Vary radius
            const controlAngle = angle - angleStep / 2;
            const controlR = size * (0.8 + Math.random() * 0.4);

            const cX = controlR * Math.cos(controlAngle);
            const cY = controlR * Math.sin(controlAngle);
            const pX = r * Math.cos(angle);
            const pY = r * Math.sin(angle);

            ctx.quadraticCurveTo(cX, cY, pX, pY);
        }

        // Soft blur for watercolor effect
        ctx.filter = `blur(${20 + Math.random() * 40}px)`;
        ctx.fill();

        // Add a second, slightly smaller/different layer for depth
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light - 10}%, 0.2)`;
        ctx.filter = `blur(${10 + Math.random() * 20}px)`;
        ctx.scale(0.8, 0.8);
        ctx.fill();

        ctx.restore();
    };

    const drawTextureOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 15;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;
        }
        ctx.putImageData(imageData, 0, 0);
    };

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full -z-10"
        />
    );
}
