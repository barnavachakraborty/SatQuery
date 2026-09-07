"use client";

import React, { useEffect, useRef } from "react";

export const FallingSnowBackground: React.FC<{ opacity?: number }> = ({ opacity = 0.6 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Flake parameters
    const flakeCount = 140;
    const flakes: Array<{
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 1.2 + 0.5,
        speedX: Math.random() * 0.6 - 0.3,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.01;

      for (let i = 0; i < flakeCount; i++) {
        const f = flakes[i];
        f.y += f.speedY;
        f.x += Math.sin(angle + i) * 0.4 + f.speedX;

        // Reset if passed bottom or sides
        if (f.y > height) {
          f.y = -5;
          f.x = Math.random() * width;
        }
        if (f.x > width) f.x = 0;
        if (f.x < 0) f.x = width;

        // Draw soft glowing snowflake
        ctx.beginPath();
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * 2);
        grad.addColorStop(0, `rgba(255, 255, 255, ${f.opacity * opacity})`);
        grad.addColorStop(0.6, `rgba(180, 220, 255, ${f.opacity * opacity * 0.5})`);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = grad;
        ctx.arc(f.x, f.y, f.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-1000"
      style={{ opacity }}
    />
  );
};
