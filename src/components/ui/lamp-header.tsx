import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

export const LampHeader = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const background = useMotionTemplate`
    radial-gradient(
      400px circle at ${mouseX}px ${mouseY}px,
      hsl(var(--primary) / 0.2),
      transparent 80%
    )
  `;

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ background }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              hsl(var(--accent) / 0.1),
              transparent 80%
            )
          `,
        }}
      />
    </motion.div>
  );
};
