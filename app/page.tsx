"use client";
import ElementList from "@/components/ElementList";
import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: { x: number; y: number; size: number; speed: number }[] =
      [];
    const numParticles = 100;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 1 + 0.5,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"; // Black particles
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const update = () => {
      particles.forEach((particle) => {
        particle.y += particle.speed;
        if (particle.y > canvas.height) {
          particle.y = 0 - particle.size;
          particle.x = Math.random() * canvas.width;
        }
      });
    };

    const animate = () => {
      draw();
      update();
      requestAnimationFrame(animate);
    };

    // Set canvas size to match the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    animate();

    // Adjust canvas size on window resize
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className=" min-w-screen min-h-screen">
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 right-0 w-full min-w-screen min-h-screen h-full  z-1"
      ></canvas>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto min-h-screen flex items-center justify-center">
        <ElementList />
      </div>
    </div>
  );
}
