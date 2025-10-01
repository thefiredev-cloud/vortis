"use client";

import { useEffect, useRef } from "react";

interface OrbBackgroundProps {
  className?: string;
}

export function OrbBackground({ className = "" }: OrbBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Orb configuration
    const orbs = [
      {
        x: 0.2,
        y: 0.3,
        baseRadius: 300,
        color: { r: 52, g: 211, b: 153 }, // emerald
        speed: 0.0005,
        phase: 0,
      },
      {
        x: 0.8,
        y: 0.4,
        baseRadius: 350,
        color: { r: 34, g: 211, b: 238 }, // cyan
        speed: 0.0007,
        phase: Math.PI / 3,
      },
      {
        x: 0.5,
        y: 0.7,
        baseRadius: 280,
        color: { r: 168, g: 85, b: 247 }, // purple
        speed: 0.0006,
        phase: Math.PI / 2,
      },
    ];

    const drawOrb = (
      x: number,
      y: number,
      radius: number,
      color: { r: number; g: number; b: number },
      alpha: number
    ) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += 0.01;

      orbs.forEach((orb) => {
        // Animate position
        const offsetX = Math.sin(time * orb.speed + orb.phase) * 100;
        const offsetY = Math.cos(time * orb.speed + orb.phase) * 100;

        const x = canvas.width * orb.x + offsetX;
        const y = canvas.height * orb.y + offsetY;

        // Animate radius with pulsing effect
        const radiusVariation = Math.sin(time * orb.speed * 2 + orb.phase) * 50;
        const radius = orb.baseRadius + radiusVariation;

        // Draw multiple layers for glow effect
        drawOrb(x, y, radius * 1.2, orb.color, 0.08);
        drawOrb(x, y, radius * 0.8, orb.color, 0.12);
        drawOrb(x, y, radius * 0.5, orb.color, 0.15);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      style={{
        filter: "blur(80px)",
        opacity: 0.6,
      }}
    />
  );
}
