import React, { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

interface ParticleBackgroundProps {
  className?: string;
  particleCount?: number;
  particleColors?: string[];
  maxSize?: number;
  minSize?: number;
  maxSpeed?: number;
  connectParticles?: boolean;
  connectDistance?: number;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  className = "",
  particleCount = 30,
  particleColors = ["#6366f1", "#8b5cf6", "#d946ef"],
  maxSize = 5,
  minSize = 1,
  maxSpeed = 0.5,
  connectParticles = true,
  connectDistance = 100,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = useRef<number | null>(null);

  // Adjust particle count based on screen size for performance
  const adjustedParticleCount =
    typeof window !== "undefined" && window.innerWidth < 768
      ? Math.floor(particleCount * 0.5)
      : particleCount;

  // Initialize particles
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const updateDimensions = () => {
      if (!canvas.parentElement) return;

      const { width, height } = canvas.parentElement.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      setDimensions({ width, height });
    };

    updateDimensions();

    // Create particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < adjustedParticleCount; i++) {
      const size = Math.random() * (maxSize - minSize) + minSize;
      newParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size,
        speedX: (Math.random() - 0.5) * maxSpeed,
        speedY: (Math.random() - 0.5) * maxSpeed,
        color:
          particleColors[Math.floor(Math.random() * particleColors.length)],
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    setParticles(newParticles);

    // Handle resize
    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [adjustedParticleCount, maxSize, minSize, maxSpeed, particleColors]);

  // Animation loop - using a ref to store particles state to avoid re-renders
  const particlesRef = useRef<Particle[]>(particles);

  // Update the ref when particles state changes
  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || particles.length === 0 || dimensions.width === 0)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Work with the particles from ref to avoid state updates
      const currentParticles = particlesRef.current;

      // Update and draw particles
      for (let i = 0; i < currentParticles.length; i++) {
        const p = currentParticles[i];

        // Move particles
        p.x += p.speedX;
        p.y += p.speedY;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Connect particles
        if (connectParticles) {
          for (let j = i + 1; j < currentParticles.length; j++) {
            const p2 = currentParticles[j];
            const distance = Math.sqrt(
              Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2)
            );

            if (distance < connectDistance) {
              ctx.beginPath();
              ctx.strokeStyle = p.color;
              ctx.globalAlpha = (1 - distance / connectDistance) * 0.2;
              ctx.lineWidth = 1;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
        }
      }

      // No setState here - we're working with the ref
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, connectParticles, connectDistance]); // Removed particles from dependencies

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};

export default ParticleBackground;
