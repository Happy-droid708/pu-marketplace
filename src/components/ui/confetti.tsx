import { useEffect, useRef } from "react";

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  scalar?: number;
  colors?: string[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  gravity: number;
  decay: number;
  opacity: number;
}

export const triggerConfetti = (options: ConfettiOptions = {}) => {
  const {
    particleCount = 100,
    spread = 70,
    startVelocity = 45,
    decay = 0.92,
    scalar = 1,
    colors = ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"],
  } = options;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: Particle[] = [];

  // Create particles
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
    const velocity = startVelocity * (0.5 + Math.random() * 0.5);

    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: Math.cos(angle) * velocity * scalar,
      vy: Math.sin(angle) * velocity * scalar - 5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: (Math.random() * 6 + 4) * scalar,
      gravity: 0.5 + Math.random() * 0.3,
      decay: decay,
      opacity: 1,
    });
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      particle.vx *= particle.decay;
      particle.vy *= particle.decay;
      particle.rotation += particle.rotationSpeed;
      particle.opacity -= 0.01;

      if (particle.opacity <= 0 || particle.y > canvas.height) {
        particles.splice(index, 1);
        return;
      }

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      ctx.restore();
    });

    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(canvas);
    }
  };

  animate();
};

// Random confetti variations
export const randomConfetti = () => {
  const variations = [
    { spread: 90, particleCount: 150, startVelocity: 50 }, // Explosion
    { spread: 50, particleCount: 80, startVelocity: 40 }, // Focused burst
    { spread: 120, particleCount: 100, startVelocity: 35, decay: 0.85 }, // Wide spray
    { spread: 360, particleCount: 200, startVelocity: 30, scalar: 0.8 }, // Firework
  ];

  const selected = variations[Math.floor(Math.random() * variations.length)];
  triggerConfetti(selected);
};

// Celebration confetti (more intense)
export const celebrationConfetti = () => {
  // Fire multiple bursts
  triggerConfetti({ particleCount: 150, spread: 100, startVelocity: 55 });
  setTimeout(() => {
    triggerConfetti({ particleCount: 100, spread: 80, startVelocity: 45 });
  }, 200);
  setTimeout(() => {
    triggerConfetti({ particleCount: 120, spread: 90, startVelocity: 50 });
  }, 400);
};

interface ConfettiProps {
  trigger?: boolean;
  onComplete?: () => void;
}

export const Confetti = ({ trigger, onComplete }: ConfettiProps) => {
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (trigger && !hasTriggered.current) {
      hasTriggered.current = true;
      celebrationConfetti();
      if (onComplete) {
        setTimeout(onComplete, 3000);
      }
    }
  }, [trigger, onComplete]);

  return null;
};
